import type { ProgramDTO } from '../../ports/programs.port';
import type { IProgramsRepository } from '../../ports/programs.port';
import type { IContentStudentsNotifier } from '../../ports/content-students-notifier.port';
import { parseProgramCreateBody } from '../../parsing/program-body.parsing';

export class CreateProgramUseCase {
  constructor(
    private readonly programs: IProgramsRepository,
    private readonly contentStudentsNotifier: IContentStudentsNotifier
  ) {}

  async execute(body: unknown): Promise<ProgramDTO> {
    const input = parseProgramCreateBody(body);
    const created = await this.programs.create(input);
    try {
      await this.contentStudentsNotifier.notifyProgramCreated(created.id, created.name);
    } catch (err) {
      console.error('[content-notifications] notifyProgramCreated:', err);
    }
    return created;
  }
}
