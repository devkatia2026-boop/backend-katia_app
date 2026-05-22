import type { IFeedbacksRepository, TrainingFeedbackDTO } from '../../ports/feedbacks.port';
import type { IStudentTrainingFeedbackCreatedNotifier } from '../../ports/student-training-feedback-notifier.port';
import { parseTrainingFeedbackCreateBody } from '../../parsing/training-feedback-body.parsing';

export class CreateFeedbackUseCase {
  constructor(
    private readonly repo: IFeedbacksRepository,
    private readonly notifier: IStudentTrainingFeedbackCreatedNotifier
  ) {}

  async execute(body: unknown, studentSub: string): Promise<TrainingFeedbackDTO> {
    const fields = parseTrainingFeedbackCreateBody(body);
    const created = await this.repo.create({
      student_id: studentSub,
      ...fields,
    });
    const brief = await this.repo.getStudentTrainerBrief(studentSub);
    if (brief) {
      void this.notifier.notifyTrainingFeedbackCreated({
        trainerId: brief.trainer_id,
        studentId: studentSub,
        studentName: brief.full_name?.trim() || 'Aluna',
        feedbackId: created.id,
      });
    }
    return { ...created, student: null };
  }
}
