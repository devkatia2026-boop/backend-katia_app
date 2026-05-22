import type { IPointsRepository, PointDTO } from '../../ports/points.port';
import type { IPointCreatedNotifier } from '../../ports/point-created-notifier.port';
import { parsePointCreateBody } from '../../parsing/point-body.parsing';

export class CreatePointUseCase {
  constructor(
    private readonly repo: IPointsRepository,
    private readonly notifier: IPointCreatedNotifier
  ) {}

  async execute(body: unknown, studentSub: string): Promise<PointDTO> {
    const fields = parsePointCreateBody(body);
    const created = await this.repo.create({
      student_id: studentSub,
      ...fields,
    });
    const brief = await this.repo.getStudentTrainerBrief(studentSub);
    if (brief) {
      void this.notifier.notifyStudentPointCreated({
        trainerId: brief.trainer_id,
        studentId: studentSub,
        studentName: brief.full_name?.trim() || 'Aluna',
        pointId: created.id,
      });
    }
    return { ...created, student: null };
  }
}
