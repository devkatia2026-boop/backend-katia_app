import type { DatabaseModels } from './models';
import type {
  AnamnesisExclusiveDTO,
  AnamnesisExclusiveUpsertValues,
  IAnamnesisExclusiveRepository,
} from '../../application/ports/anamnesis-exclusive.port';

export class SequelizeAnamnesisExclusiveRepository implements IAnamnesisExclusiveRepository {
  constructor(
    private readonly models: Pick<DatabaseModels, 'AnamnesisExclusive' | 'Student'>
  ) {}

  async findById(id: number): Promise<AnamnesisExclusiveDTO | null> {
    const row = await this.models.AnamnesisExclusive.findByPk(id);
    return row ? (row.toJSON() as AnamnesisExclusiveDTO) : null;
  }

  async findLatestByStudentId(studentId: string): Promise<AnamnesisExclusiveDTO | null> {
    const row = await this.models.AnamnesisExclusive.findOne({
      where: { student_id: studentId },
      order: [['id', 'DESC']],
    });
    return row ? (row.toJSON() as AnamnesisExclusiveDTO) : null;
  }

  async createForStudent(
    studentId: string,
    values: AnamnesisExclusiveUpsertValues
  ): Promise<AnamnesisExclusiveDTO> {
    const row = await this.models.AnamnesisExclusive.create({
      student_id: studentId,
      ...values,
    });
    return row.toJSON() as AnamnesisExclusiveDTO;
  }

  async isStudentOfTrainer(trainerId: string, studentId: string): Promise<boolean> {
    const row = await this.models.Student.findOne({
      where: { id: studentId, trainer_id: trainerId },
      attributes: ['id'],
    });
    return row !== null;
  }
}
