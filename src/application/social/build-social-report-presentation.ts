import type { SocialReportInput } from '../parsing/social-report-body.parsing';

export function trimFeedPreview(
  value: string | null | undefined,
  maxLength = 200
): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength - 1)}…`;
}

export type SocialReportPresentation = {
  summary: string;
  detailLines: string[];
  notificationMessage: string;
  reportedName: string;
  contentPreview: string | null;
};

function formatReason(reason: string | null): string {
  return reason ? reason : 'não informado';
}

function clipForPush(text: string, maxLength = 160): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1)}…`;
}

export function buildSocialReportPresentation(params: {
  input: SocialReportInput;
  reporterName: string;
  reportedName: string;
  contentPreview: string | null;
}): SocialReportPresentation {
  const { input, reporterName, reportedName, contentPreview } = params;
  const reasonLine = `Motivo: ${formatReason(input.reason)}`;

  if (input.report_type === 'student') {
    const summary = `${reporterName} denunciou o perfil de ${reportedName}.`;
    return {
      summary,
      detailLines: [
        `Denunciante: ${reporterName}`,
        `Denunciada: ${reportedName}`,
        reasonLine,
      ],
      notificationMessage: clipForPush(summary),
      reportedName,
      contentPreview: null,
    };
  }

  const kind = input.report_type === 'post' ? 'publicação' : 'comentário';
  const contentSuffix = contentPreview ? `: "${contentPreview}"` : '';
  const summary = `${reporterName} denunciou uma ${kind} de ${reportedName}${contentSuffix}.`;

  const detailLines = [
    `Denunciante: ${reporterName}`,
    `Denunciada: ${reportedName}`,
  ];

  if (input.report_type === 'post' && input.post_id) {
    detailLines.push(`Post #${input.post_id}`);
  }
  if (input.report_type === 'comment' && input.comment_id) {
    detailLines.push(`Comentário #${input.comment_id}`);
  }

  detailLines.push(
    contentPreview ? `Conteúdo: ${contentPreview}` : 'Conteúdo: (sem texto)',
    reasonLine
  );

  return {
    summary,
    detailLines,
    notificationMessage: clipForPush(summary),
    reportedName,
    contentPreview,
  };
}
