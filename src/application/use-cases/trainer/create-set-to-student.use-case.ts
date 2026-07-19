import type { ISetAssignedNotifier } from '../../ports/set-assigned-notifier.port';
import type { ISetsToStudentsRepository, SetToStudentDTO } from '../../ports/sets-to-students.port';
import { parseSetToStudentCreateBody } from '../../parsing/set-to-student-body.parsing';

const FORBIDDEN = 'ForbiddenException';

export class CreateSetToStudentUseCase {
  constructor(
    private readonly repo: ISetsToStudentsRepository,
    private readonly setAssignedNotifier: ISetAssignedNotifier,
    private readonly getTrainerName: (trainerId: string) => Promise<string>
  ) {}

  async execute(body: unknown, trainerSub: string): Promise<SetToStudentDTO> {
    const input = parseSetToStudentCreateBody(body);
    const ok = await this.repo.studentBelongsToTrainer(input.student_id, trainerSub);
    if (!ok) {
      const err = new Error('Aluna não encontrada ou não pertence a você.');
      err.name = FORBIDDEN;
      throw err;
    }

    const created = await this.repo.create(input);
    const trainerName = await this.getTrainerName(trainerSub);

    await this.setAssignedNotifier.notifySetAssignedToStudent({
      trainerId: trainerSub,
      studentId: input.student_id,
      trainerName,
      setsId: input.sets_id,
    });

    return created;
  }
}
