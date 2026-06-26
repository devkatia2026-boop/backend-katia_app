import type { DatabaseModels } from './models';
import type {
  CreateTrainingInput,
  ITrainingsRepository,
  PatchTrainingInput,
  TrainingDTO,
} from '../../application/ports/trainings.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = ['id', 'lyric', 'description', 'time', 'created_at'] as const;

export class SequelizeTrainingsRepository implements ITrainingsRepository {
  constructor(private readonly models: Pick<DatabaseModels, 'Training'>) {}

  async listPaged(page: number, pageSize: number): Promise<PagedList<TrainingDTO>> {
    const offset = (page - 1) * pageSize;
    const [total, rows] = await Promise.all([
      this.models.Training.count(),
      this.models.Training.findAll({
        attributes: [...ATTR],
        order: [
          ['created_at', 'DESC'],
          ['id', 'DESC'],
        ],
        limit: pageSize,
        offset,
        raw: true,
      }) as Promise<TrainingDTO[]>,
    ]);
    return { items: rows, total, page, pageSize };
  }

  async findById(trainingId: number): Promise<TrainingDTO | null> {
    const row = await this.models.Training.findByPk(trainingId, {
      attributes: [...ATTR],
      raw: true,
    });
    return row ? (row as TrainingDTO) : null;
  }

  async create(input: CreateTrainingInput): Promise<TrainingDTO> {
    const row = await this.models.Training.create({
      lyric: input.lyric,
      description: input.description,
      time: input.time,
    });
    return row.get({ plain: true }) as TrainingDTO;
  }

  async update(trainingId: number, patch: PatchTrainingInput): Promise<TrainingDTO> {
    const [n] = await this.models.Training.update(patch, { where: { id: trainingId } });
    if (n === 0) {
      const err = new Error('Treino não encontrado.');
      err.name = 'NotFoundException';
      throw err;
    }
    const row = await this.models.Training.findByPk(trainingId, { attributes: [...ATTR] });
    return row!.get({ plain: true }) as TrainingDTO;
  }

  async deleteById(trainingId: number): Promise<boolean> {
    const n = await this.models.Training.destroy({ where: { id: trainingId } });
    return n > 0;
  }
}
