import { parseSubjectWellPatchBody } from '../../parsing/subject-well-body.parsing';
import type { ISubjectWellsRepository, SubjectWellDTO } from '../../ports/subject-wells.port';
import type { IWellsRepository } from '../../ports/wells.port';

const NOT_FOUND = 'NotFoundException';

export class UpdateSubjectWellUseCase {
  constructor(
    private readonly subjectWells: ISubjectWellsRepository,
    private readonly wells: IWellsRepository
  ) {}

  async execute(subjectWellId: number, body: unknown): Promise<SubjectWellDTO> {
    const patch = parseSubjectWellPatchBody(body);

    if (patch.well_id !== undefined) {
      const well = await this.wells.findById(patch.well_id);
      if (!well) {
        const err = new Error('Well não encontrado.');
        err.name = NOT_FOUND;
        throw err;
      }
    }

    return this.subjectWells.update(subjectWellId, patch);
  }
}