import type { DatabaseModels } from './models';
import type {
  AnamnesisDTO,
  AnamnesisUpsertValues,
  IStudentAnamnesisRepository,
} from '../../application/ports/student-anamnesis.port';

export class SequelizeStudentAnamnesisRepository implements IStudentAnamnesisRepository {
  constructor(
    private readonly models: Pick<DatabaseModels, 'Anamnesis' | 'Student'>
  ) {}

  async findLatestByStudentId(studentId: string): Promise<AnamnesisDTO | null> {
    const row = await this.models.Anamnesis.findOne({
      where: { student_id: studentId },
      order: [['id', 'DESC']],
    });
    return row ? (row.toJSON() as AnamnesisDTO) : null;
  }

  async createForStudent(studentId: string, values: AnamnesisUpsertValues): Promise<AnamnesisDTO> {
    const row = await this.models.Anamnesis.create({
      student_id: studentId,
      ...values,
    });
    return row.toJSON() as AnamnesisDTO;
  }

  async updateLatestForStudent(studentId: string, values: AnamnesisUpsertValues): Promise<AnamnesisDTO> {
    const latest = await this.models.Anamnesis.findOne({
      where: { student_id: studentId },
      order: [['id', 'DESC']],
    });
    if (!latest) {
      const err = new Error('Anamnese não encontrada.');
      err.name = 'AnamnesisNotFoundException';
      throw err;
    }
    await latest.update(values);
    return latest.toJSON() as AnamnesisDTO;
  }

  async deleteForTrainerStudent(trainerId: string, studentId: string): Promise<void> {
    const student = await this.models.Student.findOne({
      where: { id: studentId, trainer_id: trainerId },
    });
    if (!student) {
      const err = new Error('Aluna não encontrada.');
      err.name = 'StudentNotFoundException';
      throw err;
    }
    const n = await this.models.Anamnesis.destroy({ where: { student_id: studentId } });
    if (n === 0) {
      const err = new Error('Anamnese não encontrada.');
      err.name = 'AnamnesisNotFoundException';
      throw err;
    }
  }
}

