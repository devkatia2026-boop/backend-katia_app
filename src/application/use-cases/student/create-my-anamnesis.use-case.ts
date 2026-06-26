import type {
  AnamnesisDTO,
  AnamnesisUpsertValues,
  IStudentAnamnesisRepository,
} from '../../ports/student-anamnesis.port';

const VALIDATION = 'ValidationException';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nullableTrimmedString(value: unknown, field: string): string | null {
  if (value === null) return null;
  if (value === undefined) return undefined as unknown as null;
  if (typeof value !== 'string') {
    const err = new Error(`Campo "${field}" deve ser string ou null.`);
    err.name = VALIDATION;
    throw err;
  }
  const t = value.trim();
  return t.length === 0 ? null : t;
}

type AnamnesisSnapshot = {
  main_objective: string | null;
  place_training: string | null;
  days_for_week: string | null;
  level_experience: string | null;
  bother: string | null;
};

export class CreateMyAnamnesisUseCase {
  constructor(private readonly repo: IStudentAnamnesisRepository) {}

  async execute(studentId: string, body: unknown): Promise<AnamnesisDTO> {
    const patch = this.parse(body);
    if (Object.keys(patch).length === 0) {
      const err = new Error('Informe ao menos um campo para criar a anamnese.');
      err.name = VALIDATION;
      throw err;
    }

    const latest = await this.repo.findLatestByStudentId(studentId);
    const snapshot = this.mergeSnapshot(latest, patch);
    return this.repo.createForStudent(studentId, snapshot);
  }

  private mergeSnapshot(
    latest: AnamnesisDTO | null,
    patch: AnamnesisUpsertValues
  ): AnamnesisSnapshot {
    return {
      main_objective:
        'main_objective' in patch ? patch.main_objective ?? null : latest?.main_objective ?? null,
      place_training:
        'place_training' in patch ? patch.place_training ?? null : latest?.place_training ?? null,
      days_for_week:
        'days_for_week' in patch ? patch.days_for_week ?? null : latest?.days_for_week ?? null,
      level_experience:
        'level_experience' in patch
          ? patch.level_experience ?? null
          : latest?.level_experience ?? null,
      bother: 'bother' in patch ? patch.bother ?? null : latest?.bother ?? null,
    };
  }

  private parse(body: unknown): AnamnesisUpsertValues {
    if (!isPlainObject(body)) {
      const err = new Error('Corpo da requisição deve ser um objeto JSON.');
      err.name = VALIDATION;
      throw err;
    }
    const out: AnamnesisUpsertValues = {};
    if ('main_objective' in body)
      out.main_objective = nullableTrimmedString(body.main_objective, 'main_objective');
    if ('place_training' in body)
      out.place_training = nullableTrimmedString(body.place_training, 'place_training');
    if ('days_for_week' in body)
      out.days_for_week = nullableTrimmedString(body.days_for_week, 'days_for_week');
    if ('level_experience' in body)
      out.level_experience = nullableTrimmedString(body.level_experience, 'level_experience');
    if ('bother' in body) out.bother = nullableTrimmedString(body.bother, 'bother');
    return out;
  }
}
