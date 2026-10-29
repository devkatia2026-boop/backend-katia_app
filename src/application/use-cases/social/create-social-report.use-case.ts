import {
  buildSocialReportEmailHtml,
  buildSocialReportEmailText,
} from '../../email/social-report-email.template';
import { parseSocialReportBody } from '../../parsing/social-report-body.parsing';
import type { ISocialFeedRepository } from '../../ports/social-feed.port';
import type { ISocialReportNotifier } from '../../ports/social-report.port';
import type { ITransactionalEmailSender } from '../../ports/transactional-email.port';
import type { IRestrictionTargetsLookup } from '../../ports/restriction-targets.port';
import {
  buildSocialReportPresentation,
  trimFeedPreview,
  type SocialReportPresentation,
} from '../../social/build-social-report-presentation';

const NOT_FOUND = 'NotFoundException';
const FORBIDDEN = 'ForbiddenException';
const VALIDATION = 'ValidationException';

export type CreateSocialReportResult = { ok: true };

export class CreateSocialReportUseCase {
  constructor(
    private readonly feed: ISocialFeedRepository,
    private readonly targets: IRestrictionTargetsLookup,
    private readonly email: ITransactionalEmailSender | null,
    private readonly notifier: ISocialReportNotifier,
    private readonly reportEmailTo: string,
    private readonly loadReporter: (studentId: string) => Promise<{ full_name: string; trainer_id: string } | null>
  ) {}

  async execute(body: unknown, reporterStudentId: string): Promise<CreateSocialReportResult> {
    const input = parseSocialReportBody(body);
    const reporter = await this.loadReporter(reporterStudentId);
    if (!reporter) {
      const err = new Error('Aluna não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }

    const presentation = await this.resolveReportTarget(input, reporterStudentId, reporter.full_name);

    if (this.email) {
      const html = buildSocialReportEmailHtml({
        reporterName: reporter.full_name,
        reporterId: reporterStudentId,
        reportType: input.report_type,
        summary: presentation.summary,
        detailLines: presentation.detailLines,
      });
      const text = buildSocialReportEmailText({
        reporterName: reporter.full_name,
        reporterId: reporterStudentId,
        reportType: input.report_type,
        summary: presentation.summary,
        detailLines: presentation.detailLines,
      });
      await this.email.send({
        to: [this.reportEmailTo],
        subject: `[KI Training] Denúncia no feed — ${input.report_type}`,
        html,
        text,
      });
    } else {
      console.warn('[social-report] e-mail não configurado (SES_FROM_EMAIL / REPORT_EMAIL_TO)');
    }

    await this.notifier.notifyTrainerReport({
      reporterStudentId,
      reporterName: reporter.full_name,
      trainerId: reporter.trainer_id,
      input,
      subjectSummary: presentation.summary,
      detailLines: presentation.detailLines,
      notificationMessage: presentation.notificationMessage,
      reportedName: presentation.reportedName,
      contentPreview: presentation.contentPreview,
    });

    return { ok: true };
  }

  private async resolveStudentName(studentId: string): Promise<string> {
    const name = await this.targets.resolveDisplayName('student', studentId);
    return name?.trim() || studentId;
  }

  private async resolveReportTarget(
    input: ReturnType<typeof parseSocialReportBody>,
    reporterStudentId: string,
    reporterName: string
  ): Promise<SocialReportPresentation> {
    if (input.report_type === 'post') {
      const post = await this.feed.findPostById(input.post_id!);
      if (!post) {
        const err = new Error('Post não encontrado.');
        err.name = NOT_FOUND;
        throw err;
      }
      if (post.author_type === 'trainer') {
        const err = new Error('Posts da treinadora não podem ser denunciados.');
        err.name = FORBIDDEN;
        throw err;
      }
      if (post.author_id?.trim().toLowerCase() === reporterStudentId.trim().toLowerCase()) {
        const err = new Error('Não é possível denunciar o próprio post.');
        err.name = VALIDATION;
        throw err;
      }
      const authorId = post.author_id?.trim().toLowerCase();
      if (!authorId) {
        const err = new Error('Autora do post não encontrada.');
        err.name = NOT_FOUND;
        throw err;
      }
      const reportedName = await this.resolveStudentName(authorId);
      const contentPreview =
        trimFeedPreview(post.content) ??
        (trimFeedPreview(post.image) ? 'Publicação com imagem' : null);

      return buildSocialReportPresentation({
        input,
        reporterName,
        reportedName,
        contentPreview,
      });
    }

    if (input.report_type === 'comment') {
      const comment = await this.feed.findCommentById(input.comment_id!);
      if (!comment) {
        const err = new Error('Comentário não encontrado.');
        err.name = NOT_FOUND;
        throw err;
      }
      if (comment.author_type === 'trainer') {
        const err = new Error('Comentários da treinadora não podem ser denunciados.');
        err.name = FORBIDDEN;
        throw err;
      }
      if (comment.author_id?.trim().toLowerCase() === reporterStudentId.trim().toLowerCase()) {
        const err = new Error('Não é possível denunciar o próprio comentário.');
        err.name = VALIDATION;
        throw err;
      }
      const authorId = comment.author_id?.trim().toLowerCase();
      if (!authorId) {
        const err = new Error('Autora do comentário não encontrada.');
        err.name = NOT_FOUND;
        throw err;
      }
      const reportedName = await this.resolveStudentName(authorId);

      return buildSocialReportPresentation({
        input,
        reporterName,
        reportedName,
        contentPreview: trimFeedPreview(comment.content),
      });
    }

    const targetId = input.target_id!;
    if (targetId === reporterStudentId.trim().toLowerCase()) {
      const err = new Error('Não é possível denunciar a si mesma.');
      err.name = VALIDATION;
      throw err;
    }
    if (!(await this.targets.studentExists(targetId))) {
      const err = new Error('Aluna denunciada não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }

    const reportedName = await this.resolveStudentName(targetId);

    return buildSocialReportPresentation({
      input,
      reporterName,
      reportedName,
      contentPreview: null,
    });
  }
}
