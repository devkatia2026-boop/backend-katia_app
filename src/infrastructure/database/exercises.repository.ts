import type { DatabaseModels } from './models';
import type {
  CreateExerciseInput,
  ExerciseDTO,
  IExercisesRepository,
  PatchExerciseInput,
} from '../../application/ports/exercises.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = ['id', 'name', 'video', 'type', 'description', 'level', 'created_at'] as const;

export class SequelizeExercisesRepository implements IExercisesRepository {
  constructor(private readonly models: Pick<DatabaseModels, 'Exercise'>) {}

  async listPaged(page: number, pageSize: number): Promise<PagedList<ExerciseDTO>> {
    const offset = (page - 1) * pageSize;
    const [total, rows] = await Promise.all([
      this.models.Exercise.count(),
      this.models.Exercise.findAll({
        attributes: [...ATTR],
        order: [
          ['created_at', 'DESC'],
          ['id', 'DESC'],
        ],
        limit: pageSize,
        offset,
        raw: true,
      }) as Promise<ExerciseDTO[]>,
    ]);
    return { items: rows, total, page, pageSize };
  }

  findById(exerciseId: number): Promise<ExerciseDTO | null> {
    return this.models.Exercise.findByPk(exerciseId, {
      attributes: [...ATTR],
      raw: true,
    }) as Promise<ExerciseDTO | null>;
  }

  async create(input: CreateExerciseInput): Promise<ExerciseDTO> {
    const created = await this.models.Exercise.create(input as any);
    const row = await this.findById(created.get('id') as number);
    return row as ExerciseDTO;
  }

  async update(exerciseId: number, patch: PatchExerciseInput): Promise<ExerciseDTO> {
    const [affected] = await this.models.Exercise.update(patch as any, { where: { id: exerciseId } });
    if (affected === 0) {
      const err = new Error('Exercício não encontrado.');
      err.name = 'NotFoundException';
      throw err;
    }
    const row = await this.findById(exerciseId);
    return row as ExerciseDTO;
  }

  async deleteById(exerciseId: number): Promise<boolean> {
    const affected = await this.models.Exercise.destroy({ where: { id: exerciseId } });
    return affected > 0;
  }
}

