import type { DatabaseModels } from './models';
import { Op, QueryTypes } from 'sequelize';
import type {
  AnamnesisDTO,
  AnamnesisUpsertValues,
  IStudentAnamnesisRepository,
} from '../../application/ports/student-anamnesis.port';
import type { PagedList } from '../../application/ports/social-feed.port';

type AnamnesisRow = {
  id: number;
  student_id: string;
  main_objective: string | null;
  place_training: string | null;
  days_for_week: string | null;
  level_experience: string | null;
  bother: string | null;
  created_at: Date;
};

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

  async findLatestForTrainerStudent(
    trainerId: string,
    studentId: string
  ): Promise<AnamnesisDTO | null> {
    const student = await this.models.Student.findOne({
      where: { id: studentId, trainer_id: trainerId },
      attributes: ['id'],
    });
    if (!student) {
      const err = new Error('Aluna não encontrada.');
      err.name = 'StudentNotFoundException';
      throw err;
    }
    return this.findLatestByStudentId(studentId);
  }

  async listLatestForTrainer(trainerId: string): Promise<AnamnesisDTO[]> {
    const rows = await this.models.Anamnesis.sequelize!.query<AnamnesisRow>(
      `SELECT DISTINCT ON (a.student_id)
         a.id, a.student_id, a.main_objective, a.place_training,
         a.days_for_week, a.level_experience, a.bother, a.created_at
       FROM anamneses a
       INNER JOIN students s ON s.id = a.student_id
       WHERE s.trainer_id = :trainerId
       ORDER BY a.student_id, a.id DESC`,
      { replacements: { trainerId }, type: QueryTypes.SELECT }
    );
    return rows;
  }

  async listDivisionHistoryByStudentId(
    studentId: string,
    page: number,
    pageSize: number
  ): Promise<PagedList<AnamnesisDTO>> {
    const offset = (page - 1) * pageSize;
    const where = {
      student_id: studentId,
      bother: { [Op.ne]: null },
      days_for_week: { [Op.ne]: null },
    };
    const [total, rows] = await Promise.all([
      this.models.Anamnesis.count({ where }),
      this.models.Anamnesis.findAll({
        where,
        order: [['id', 'DESC']],
        limit: pageSize,
        offset,
      }),
    ]);
    return {
      items: rows.map((row) => row.toJSON() as AnamnesisDTO),
      total,
      page,
      pageSize,
    };
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

