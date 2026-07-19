import { col, fn, Op, where, type WhereOptions } from 'sequelize';
import type { Student } from './models/student.model';
import type { DatabaseModels } from './models';
import type { StudentProfileUpdateValues } from '../../application/ports/user-profile-updater.port';
import type {
  ITrainerStudentsRepository,
  PaginatedTrainerStudents,
  TrainerStudentPlanFilter,
  TrainerStudentPublic,
  TrainerStudentSearchField,
  TrainerStudentValidationFilter,
  TrainerStudentsValidationSummary,
} from '../../application/ports/trainer-students.port';

function escapeLikePattern(term: string): string {
  return term.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

function toPublic(student: Student): TrainerStudentPublic {
  const j = student.toJSON() as Record<string, unknown>;
  delete j.refresh_token;
  delete j.expo_push_token;
  return j as TrainerStudentPublic;
}

function unaccentLikeCondition(columnName: string, pattern: string) {
  return where(fn('unaccent', fn('lower', col(columnName))), {
    [Op.like]: fn('unaccent', fn('lower', pattern)),
  });
}

function validationEqualsCondition(value: TrainerStudentValidationFilter) {
  return where(fn('lower', col('validation')), value);
}

function planFilterCondition(plan: TrainerStudentPlanFilter): WhereOptions {
  if (plan === 'exclusive') {
    return {
      [Op.or]: [
        where(fn('lower', col('type_plan')), 'exclusive'),
        where(fn('lower', col('type_plan')), 'consultoria-exclusiva'),
      ],
    };
  }

  return {
    [Op.or]: [
      where(fn('lower', col('type_plan')), 'comum'),
      where(fn('lower', col('type_plan')), 'plano-academia'),
    ],
  };
}

function buildTrainerWhere(
  trainerId: string,
  validation?: TrainerStudentValidationFilter,
  plan?: TrainerStudentPlanFilter
): WhereOptions {
  const conditions: WhereOptions[] = [{ trainer_id: trainerId }];
  if (validation) {
    conditions.push(validationEqualsCondition(validation));
  }
  if (plan) {
    conditions.push(planFilterCondition(plan));
  }
  return conditions.length === 1 ? conditions[0] : { [Op.and]: conditions };
}

export class SequelizeTrainerStudentsRepository implements ITrainerStudentsRepository {
  constructor(private readonly models: Pick<DatabaseModels, 'Student'>) {}

  async countValidationSummary(trainerId: string): Promise<TrainerStudentsValidationSummary> {
    const [sim, nao, exclusive, comum] = await Promise.all([
      this.models.Student.count({
        where: {
          [Op.and]: [{ trainer_id: trainerId }, validationEqualsCondition('sim')],
        },
      }),
      this.models.Student.count({
        where: {
          [Op.and]: [{ trainer_id: trainerId }, validationEqualsCondition('nao')],
        },
      }),
      this.models.Student.count({
        where: buildTrainerWhere(trainerId, undefined, 'exclusive'),
      }),
      this.models.Student.count({
        where: buildTrainerWhere(trainerId, undefined, 'comum'),
      }),
    ]);
    return { sim, nao, exclusive, comum };
  }

  async listPaged(
    trainerId: string,
    page: number,
    pageSize: number,
    validation?: TrainerStudentValidationFilter,
    plan?: TrainerStudentPlanFilter
  ): Promise<PaginatedTrainerStudents> {
    const offset = (page - 1) * pageSize;
    const { rows, count } = await this.models.Student.findAndCountAll({
      where: buildTrainerWhere(trainerId, validation, plan),
      order: [['full_name', 'ASC']],
      limit: pageSize,
      offset,
    });
    return {
      items: rows.map((r) => toPublic(r)),
      total: count,
      page,
      pageSize,
    };
  }

  async searchPaged(
    trainerId: string,
    field: TrainerStudentSearchField,
    term: string,
    page: number,
    pageSize: number,
    validation?: TrainerStudentValidationFilter,
    plan?: TrainerStudentPlanFilter
  ): Promise<PaginatedTrainerStudents> {
    const pattern = `%${escapeLikePattern(term.trim())}%`;
    const column = field === 'name' ? 'full_name' : 'email';
    const offset = (page - 1) * pageSize;
    const conditions: WhereOptions[] = [
      { trainer_id: trainerId },
      unaccentLikeCondition(column, pattern),
    ];
    if (validation) {
      conditions.push(validationEqualsCondition(validation));
    }
    if (plan) {
      conditions.push(planFilterCondition(plan));
    }

    const { rows, count } = await this.models.Student.findAndCountAll({
      where: {
        [Op.and]: conditions as WhereOptions[],
      },
      order: [['full_name', 'ASC']],
      limit: pageSize,
      offset,
    });

    return {
      items: rows.map((r) => toPublic(r)),
      total: count,
      page,
      pageSize,
    };
  }

  async findOneForTrainer(
    trainerId: string,
    studentId: string
  ): Promise<TrainerStudentPublic | null> {
    const row = await this.models.Student.findOne({
      where: { id: studentId, trainer_id: trainerId },
    });
    return row ? toPublic(row) : null;
  }

  async updateStudentForTrainer(
    trainerId: string,
    studentId: string,
    values: StudentProfileUpdateValues
  ): Promise<void> {
    const [affected] = await this.models.Student.update(values, {
      where: { id: studentId, trainer_id: trainerId },
    });
    if (affected === 0) {
      const err = new Error('Aluna não encontrada ou não pertence a este treinador.');
      err.name = 'StudentNotFoundException';
      throw err;
    }
  }
}
