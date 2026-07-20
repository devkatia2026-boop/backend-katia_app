import type { DatabaseModels } from './models';
import { Op } from 'sequelize';
import type {
  IRevaluationsRepository,
  RevaluationCompareResult,
  RevaluationDTO,
  RevaluationStudentReminder,
  RevaluationUpsertValues,
} from '../../application/ports/revaluations.port';
import {
  exclusiveValidatedSimWhere,
  revaluationPendingDailyReminderWhere,
} from './student-revaluation-eligibility';

export class SequelizeRevaluationsRepository implements IRevaluationsRepository {
  constructor(private readonly models: Pick<DatabaseModels, 'Revaluation' | 'Student'>) {}

  async createForStudent(studentId: string, values: RevaluationUpsertValues): Promise<RevaluationDTO> {
    const row = await this.models.Revaluation.create({
      student_id: studentId,
      ...values,
    });
    return row.toJSON() as RevaluationDTO;
  }

  async listByStudentId(studentId: string): Promise<RevaluationDTO[]> {
    const rows = await this.models.Revaluation.findAll({
      where: { student_id: studentId },
      order: [
        ['created_at', 'DESC'],
        ['id', 'DESC'],
      ],
    });
    return rows.map((r) => r.toJSON() as RevaluationDTO);
  }

  async listForTrainerStudent(trainerId: string, studentId: string): Promise<RevaluationDTO[]> {
    await this.assertTrainerStudent(trainerId, studentId);
    return this.listByStudentId(studentId);
  }

  async findByIdForTrainerStudent(
    trainerId: string,
    studentId: string,
    revaluationId: number
  ): Promise<RevaluationDTO | null> {
    await this.assertTrainerStudent(trainerId, studentId);
    const row = await this.models.Revaluation.findOne({
      where: { id: revaluationId, student_id: studentId },
    });
    return row ? (row.toJSON() as RevaluationDTO) : null;
  }

  async compareForTrainerStudent(
    trainerId: string,
    studentId: string,
    firstId: number,
    secondId: number
  ): Promise<RevaluationCompareResult | null> {
    await this.assertTrainerStudent(trainerId, studentId);

    const rows = await this.models.Revaluation.findAll({
      where: {
        student_id: studentId,
        id: { [Op.in]: [firstId, secondId] },
      },
    });
    if (rows.length !== 2) return null;

    const firstRow = rows.find((r) => r.get('id') === firstId);
    const secondRow = rows.find((r) => r.get('id') === secondId);
    if (!firstRow || !secondRow) return null;

    const first = firstRow.toJSON() as RevaluationDTO;
    const second = secondRow.toJSON() as RevaluationDTO;
    const firstTime = new Date(first.created_at).getTime();
    const secondTime = new Date(second.created_at).getTime();

    if (firstTime <= secondTime) {
      return { student_id: studentId, first, second };
    }
    return { student_id: studentId, first: second, second: first };
  }

  async getInRevalutionStatus(studentId: string): Promise<boolean> {
    const row = await this.models.Student.findByPk(studentId, {
      attributes: ['in_revalution'],
    });
    if (!row) {
      const err = new Error('Aluna não encontrada.');
      err.name = 'StudentNotFoundException';
      throw err;
    }
    return Boolean(row.get('in_revalution'));
  }

  async finishRevalution(studentId: string): Promise<void> {
    await this.models.Student.update({ in_revalution: false }, { where: { id: studentId } });
  }

  async listStudentsPendingDailyReminder(): Promise<RevaluationStudentReminder[]> {
    const rows = await this.models.Student.findAll({
      attributes: ['id', 'trainer_id', 'expo_push_token'],
      where: revaluationPendingDailyReminderWhere(),
      raw: true,
    });
    return rows as RevaluationStudentReminder[];
  }

  async startRevaluationForTrainer(
    trainerId: string,
    studentIds?: string[]
  ): Promise<RevaluationStudentReminder[]> {
    const conditions: unknown[] = [{ trainer_id: trainerId }, exclusiveValidatedSimWhere()];
    if (studentIds && studentIds.length > 0) {
      conditions.push({ id: { [Op.in]: studentIds } });
    }
    const where = { [Op.and]: conditions };

    await this.models.Student.update({ in_revalution: true }, { where });

    const rows = await this.models.Student.findAll({
      attributes: ['id', 'trainer_id', 'expo_push_token'],
      where,
      raw: true,
    });
    return rows as RevaluationStudentReminder[];
  }

  private async assertTrainerStudent(trainerId: string, studentId: string): Promise<void> {
    const row = await this.models.Student.findOne({
      where: { id: studentId, trainer_id: trainerId },
      attributes: ['id'],
    });
    if (!row) {
      const err = new Error('Aluna não encontrada.');
      err.name = 'StudentNotFoundException';
      throw err;
    }
  }
}
