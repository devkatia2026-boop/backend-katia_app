import { mapAnamnesisExclusiveToPhysical } from '../../anamnesis-exclusive/anamnesis-exclusive-to-physical';
import { parseAnamnesisExclusiveCreateBody } from '../../parsing/anamnesis-exclusive-body.parsing';
import type {
  AnamnesisExclusiveDTO,
  AnamnesisExclusiveUpsertValues,
  IAnamnesisExclusiveRepository,
} from '../../ports/anamnesis-exclusive.port';
import type { IStudentPhysicalsRepository } from '../../ports/student-physicals.port';

const VALIDATION = 'ValidationException';
const ALREADY_EXISTS = 'AnamnesisExclusiveAlreadyExistsException';

export class CreateMyAnamnesisExclusiveUseCase {
  constructor(
    private readonly repo: IAnamnesisExclusiveRepository,
    private readonly physicalsRepo: IStudentPhysicalsRepository
  ) {}

  async execute(
    studentId: string,
    body: unknown,
    uploadedValues?: AnamnesisExclusiveUpsertValues
  ): Promise<AnamnesisExclusiveDTO> {
    const hasUploads = uploadedValues !== undefined && Object.keys(uploadedValues).length > 0;
    const parsed = parseAnamnesisExclusiveCreateBody(body, { skipFileFields: hasUploads });
    const values = hasUploads ? { ...parsed, ...uploadedValues } : parsed;
    if (Object.keys(values).length === 0) {
      const err = new Error('Informe ao menos um campo para criar a anamnese exclusive.');
      err.name = VALIDATION;
      throw err;
    }
    const existing = await this.repo.findLatestByStudentId(studentId);
    if (existing) {
      const err = new Error('Anamnese exclusive já existe para esta aluna.');
      err.name = ALREADY_EXISTS;
      throw err;
    }
    const created = await this.repo.createForStudent(studentId, values);
    await this.syncPhysical(studentId, values);
    return created;
  }

  private async syncPhysical(studentId: string, values: AnamnesisExclusiveUpsertValues): Promise<void> {
    const physicalValues = mapAnamnesisExclusiveToPhysical(values);
    if (Object.keys(physicalValues).length === 0) return;

    const [latest] = await this.physicalsRepo.listByStudentId(studentId);
    if (latest) {
      await this.physicalsRepo.updateOwned(studentId, latest.id, physicalValues);
      return;
    }
    await this.physicalsRepo.createForStudent(studentId, physicalValues);
  }
}
