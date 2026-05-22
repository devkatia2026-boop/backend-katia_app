import type { DatabaseModels } from './models';
import type {
  EvolutionDTO,
  EvolutionUpsertValues,
  IStudentEvolutionsRepository,
} from '../../application/ports/student-evolutions.port';

export class SequelizeStudentEvolutionsRepository implements IStudentEvolutionsRepository {
  constructor(private readonly models: Pick<DatabaseModels, 'Evolution' | 'Student'>) {}

  async listByStudentId(studentId: string): Promise<EvolutionDTO[]> {
    const rows = await this.models.Evolution.findAll({
      where: { student_id: studentId },
      attributes: ['id', 'student_id', 'original_photo', 'current_photo', 'created_at'],
      order: [
        ['created_at', 'DESC'],
        ['id', 'DESC'],
      ],
      raw: true,
    });
    return rows as EvolutionDTO[];
  }

  async findOneOwned(studentId: string, evolutionId: number): Promise<EvolutionDTO | null> {
    const row = await this.models.Evolution.findOne({
      where: { id: evolutionId, student_id: studentId },
      attributes: ['id', 'student_id', 'original_photo', 'current_photo', 'created_at'],
    });
    return row ? (row.get({ plain: true }) as EvolutionDTO) : null;
  }

  async createForStudent(studentId: string, values: EvolutionUpsertValues): Promise<EvolutionDTO> {
    const row = await this.models.Evolution.create({
      student_id: studentId,
      original_photo: values.original_photo ?? null,
      current_photo: values.current_photo ?? null,
    });
    return row.get({ plain: true }) as EvolutionDTO;
  }

  async updateOwned(
    studentId: string,
    evolutionId: number,
    values: EvolutionUpsertValues
  ): Promise<EvolutionDTO> {
    const row = await this.models.Evolution.findOne({
      where: { id: evolutionId, student_id: studentId },
    });
    if (!row) {
      const err = new Error('Evolução não encontrada.');
      err.name = 'EvolutionNotFoundException';
      throw err;
    }
    await row.update(values);
    return row.get({ plain: true }) as EvolutionDTO;
  }

  async listForTrainerStudent(trainerId: string, studentId: string): Promise<EvolutionDTO[]> {
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
