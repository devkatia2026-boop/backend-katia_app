import type { DatabaseModels } from './models';
import type {
  IStudentPhysicalsRepository,
  PhysicalDTO,
  PhysicalUpsertValues,
} from '../../application/ports/student-physicals.port';

export class SequelizeStudentPhysicalsRepository implements IStudentPhysicalsRepository {
  constructor(private readonly models: Pick<DatabaseModels, 'Physical' | 'Student'>) {}

  async listByStudentId(studentId: string): Promise<PhysicalDTO[]> {
    const rows = await this.models.Physical.findAll({
      where: { student_id: studentId },
      order: [
        ['created_at', 'DESC'],
        ['id', 'DESC'],
      ],
    });
    return rows.map((r) => r.toJSON() as PhysicalDTO);
  }

  async findOneOwned(studentId: string, physicalId: number): Promise<PhysicalDTO | null> {
    const row = await this.models.Physical.findOne({
      where: { id: physicalId, student_id: studentId },
    });
    return row ? (row.toJSON() as PhysicalDTO) : null;
  }

  async createForStudent(studentId: string, values: PhysicalUpsertValues): Promise<PhysicalDTO> {
    const row = await this.models.Physical.create({
      student_id: studentId,
      ...values,
    });
    return row.toJSON() as PhysicalDTO;
  }

  async updateOwned(
    studentId: string,
    physicalId: number,
    values: PhysicalUpsertValues
  ): Promise<PhysicalDTO> {
    const row = await this.models.Physical.findOne({
      where: { id: physicalId, student_id: studentId },
    });
    if (!row) {
      const err = new Error('Registro físico não encontrado.');
      err.name = 'PhysicalNotFoundException';
      throw err;
    }
    await row.update(values);
    return row.toJSON() as PhysicalDTO;
  }

  async listForTrainerStudent(trainerId: string, studentId: string): Promise<PhysicalDTO[]> {
    const student = await this.models.Student.findOne({
      where: { id: studentId, trainer_id: trainerId },
    });
    if (!student) {
      const err = new Error('Aluna não encontrada.');
      err.name = 'StudentNotFoundException';
      throw err;
    }
    return this.listByStudentId(studentId);
  }
}
