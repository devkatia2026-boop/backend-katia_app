import { parseSubjectWellCreateBody } from '../../parsing/subject-well-body.parsing';
import type { ISubjectWellsRepository, SubjectWellDTO } from '../../ports/subject-wells.port';
import type { IWellsRepository } from '../../ports/wells.port';

const NOT_FOUND = 'NotFoundException';

export class CreateSubjectWellUseCase {
  constructor(
    private readonly subjectWells: ISubjectWellsRepository,
    private readonly wells: IWellsRepository
  ) {}

  async execute(body: unknown): Promise<SubjectWellDTO> {
    const input = parseSubjectWellCreateBody(body);
    const well = await this.wells.findById(input.well_id);
    if (!well) {
      const err = new Error('Well não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    return this.subjectWells.create(input);
  }
}