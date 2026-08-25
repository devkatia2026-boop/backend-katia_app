import type { DatabaseModels } from './models';
import type {
  CreateRepsToTrainingInput,
  IRepsToTrainingsRepository,
  PatchRepsToTrainingInput,
  RepsToTrainingDTO,
} from '../../application/ports/reps-to-trainings.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = ['id', 'exercise_id', 'training_id', 'reps', 'obs', 'created_at'] as const;

function toDto(raw: RepsToTrainingDTO): RepsToTrainingDTO {
  return {
    id: raw.id,
    exercise_id: raw.exercise_id,
    training_id: raw.training_id,
    reps: raw.reps,
    obs: raw.obs,
    created_at: raw.created_at,
  };
}

export class SequelizeRepsToTrainingsRepository implements IRepsToTrainingsRepository {
  constructor(private readonly models: Pick<DatabaseModels, 'RepsToTrainings'>) {}

  async listByExerciseAndTraining(
    exerciseId: number,
    trainingId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<RepsToTrainingDTO>> {
    const offset = (page - 1) * pageSize;
    const where = { exercise_id: exerciseId, training_id: trainingId };

    const [total, rows] = await Promise.all([
      this.models.RepsToTrainings.count({ where }),
      this.models.RepsToTrainings.findAll({
        attributes: [...ATTR],
        where,
        order: [
          ['created_at', 'DESC'],
          ['id', 'DESC'],
        ],
        limit: pageSize,
        offset,
        raw: true,
      }) as unknown as Promise<RepsToTrainingDTO[]>,
    ]);

    return {
      items: rows.map(toDto),
      total,
      page,
      pageSize,
    };
  }

  async findById(id: number): Promise<RepsToTrainingDTO | null> {
    const row = await this.models.RepsToTrainings.findByPk(id, {
      attributes: [...ATTR],
      raw: true,
    });
    if (!row) return null;
    return toDto(row as unknown as RepsToTrainingDTO);
  }

  async create(input: CreateRepsToTrainingInput): Promise<RepsToTrainingDTO> {
    const created = await this.models.RepsToTrainings.create(input as any);
    const row = await this.findById(created.get('id') as number);
    return row as RepsToTrainingDTO;
  }

  async update(id: number, patch: PatchRepsToTrainingInput): Promise<RepsToTrainingDTO> {
    const [affected] = await this.models.RepsToTrainings.update(patch as any, { where: { id } });
    if (affected === 0) {
      const err = new Error('Orientação (reps/training) não encontrada.');
      err.name = 'NotFoundException';
      throw err;
    }
    const row = await this.findById(id);
    if (!row) {
      const err = new Error('Orientação (reps/training) não encontrada.');
      err.name = 'NotFoundException';
      throw err;
    }
    return row;
  }

  async deleteById(id: number): Promise<boolean> {
    const n = await this.models.RepsToTrainings.destroy({ where: { id } });
    return n > 0;
  }
}
