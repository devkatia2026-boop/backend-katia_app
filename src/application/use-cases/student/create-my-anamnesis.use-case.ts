import type {
  AnamnesisDTO,
  AnamnesisUpsertValues,
  IStudentAnamnesisRepository,
} from '../../ports/student-anamnesis.port';

const VALIDATION = 'ValidationException';
const ALREADY_EXISTS = 'AnamnesisAlreadyExistsException';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nullableTrimmedString(value: unknown, field: string): string | null {
  if (value === null) return null;
  if (value === undefined) return undefined as unknown as null; // caller checks key existence
  if (typeof value !== 'string') {
    const err = new Error(`Campo "${field}" deve ser string ou null.`);
    err.name = VALIDATION;
    throw err;
  }
  const t = value.trim();
  return t.length === 0 ? null : t;
}

export class CreateMyAnamnesisUseCase {
  constructor(private readonly repo: IStudentAnamnesisRepository) {}

  async execute(studentId: string, body: unknown): Promise<AnamnesisDTO> {
    const values = this.parse(body);
    if (Object.keys(values).length === 0) {
      const err = new Error('Informe ao menos um campo para criar a anamnese.');
      err.name = VALIDATION;
      throw err;
    }

    const existing = await this.repo.findLatestByStudentId(studentId);
    if (existing) {
      const err = new Error('Anamnese já existe para esta aluna.');
      err.name = ALREADY_EXISTS;
      throw err;
    }

    return this.repo.createForStudent(studentId, values);
  }

  private parse(body: unknown): AnamnesisUpsertValues {
    if (!isPlainObject(body)) {
      const err = new Error('Corpo da requisição deve ser um objeto JSON.');
      err.name = VALIDATION;
      throw err;
    }
    const out: AnamnesisUpsertValues = {};
    if ('main_objective' in body) out.main_objective = nullableTrimmedString(body.main_objective, 'main_objective');
    if ('place_training' in body) out.place_training = nullableTrimmedString(body.place_training, 'place_training');
    if ('days_for_week' in body) out.days_for_week = nullableTrimmedString(body.days_for_week, 'days_for_week');
    if ('level_experience' in body) out.level_experience = nullableTrimmedString(body.level_experience, 'level_experience');
    return out;
  }
}

