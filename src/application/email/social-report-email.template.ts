export type SocialReportEmailPayload = {
  reporterName: string;
  reporterId: string;
  reportType: string;
  summary: string;
  detailLines: string[];
};

export function buildSocialReportEmailHtml(payload: SocialReportEmailPayload): string {
  const detail = payload.detailLines
    .map((line) => `<tr><td style="padding:8px 0;color:#3D2E45;font-size:14px;">${escapeHtml(line)}</td></tr>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:24px;background:linear-gradient(180deg,#9B85A7 0%,#6B2C5F 100%);font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;">
    <tr>
      <td style="padding:32px 28px;background:rgba(255,255,255,0.95);border-radius:24px;border:1px solid rgba(255,255,255,0.35);box-shadow:0 12px 40px rgba(61,46,69,0.25);">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-block;padding:12px 28px;border-radius:16px;background:linear-gradient(135deg,#7B5E8A,#6B2C5F);color:#FFFFFF;font-size:28px;font-weight:700;letter-spacing:2px;">KI</div>
          <p style="margin:12px 0 0;color:#7B5E8A;font-size:13px;font-weight:600;">Denúncia no feed</p>
        </div>
        <h1 style="margin:0 0 16px;font-size:20px;color:#3D2E45;text-align:center;">Nova denúncia recebida</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:rgba(123,94,138,0.85);text-align:center;">
          ${escapeHtml(payload.summary)}
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F5EFF7;border-radius:16px;padding:16px 20px;">
          ${detail}
        </table>
        <p style="margin:24px 0 0;font-size:12px;color:rgba(123,94,138,0.55);text-align:center;">
          Enviado por ${escapeHtml(payload.reporterName)} (${escapeHtml(payload.reporterId)})
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildSocialReportEmailText(payload: SocialReportEmailPayload): string {
  return [
    'Nova denúncia no feed KI Training',
    payload.summary,
    '',
    ...payload.detailLines,
    '',
    `Enviado por ${payload.reporterName} (${payload.reporterId})`,
  ].join('\n');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
