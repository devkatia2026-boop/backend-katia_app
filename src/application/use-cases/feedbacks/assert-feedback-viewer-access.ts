import type { IFeedbacksRepository, TrainingFeedbackDTO } from '../../ports/feedbacks.port';

const NOT_FOUND = 'NotFoundException';
const FORBIDDEN = 'ForbiddenException';

export async function assertFeedbackViewerAccess(
  repo: IFeedbacksRepository,
  feedbackId: number,
  auth: { role: 'student' | 'trainer'; sub: string }
): Promise<TrainingFeedbackDTO> {
  const row = await repo.findById(feedbackId);
  if (!row) {
    const err = new Error('Feedback não encontrado.');
    err.name = NOT_FOUND;
    throw err;
  }
  if (auth.role === 'student') {
    if (row.student_id !== auth.sub) {
      const err = new Error('Você não pode acessar este feedback.');
      err.name = FORBIDDEN;
      throw err;
    }
    return { ...row, student: null };
  }
  const brief = await repo.getStudentTrainerBrief(row.student_id);
  if (!brief || brief.trainer_id !== auth.sub) {
    const err = new Error('Este feedback não é de uma aluna sua.');
    err.name = FORBIDDEN;
    throw err;
  }
  return row;
}
