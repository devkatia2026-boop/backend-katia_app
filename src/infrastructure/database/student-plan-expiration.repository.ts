import type { DatabaseModels } from './models';
import type {
  ExpireStudentPlansBatch,
  IStudentPlanExpirationRepository,
} from '../../application/ports/student-plan-expiration.port';

export class SequelizeStudentPlanExpirationRepository implements IStudentPlanExpirationRepository {
  constructor(private readonly models: Pick<DatabaseModels, 'Student'>) {}

  async expirePlansForDate(dateIso: string): Promise<ExpireStudentPlansBatch> {
    const students = (await this.models.Student.findAll({
      attributes: ['id'],
      where: { validation_plan: dateIso },
      raw: true,
    })) as Array<{ id: string }>;

    if (students.length === 0) {
      return {
        date: dateIso,
        updated: 0,
        loggedOut: 0,
        studentIds: [],
      };
    }

    const [updated] = await this.models.Student.update(
      {
        type_plan: null,
        validation: 'nao',
        refresh_token: null,
      },
      {
        where: { validation_plan: dateIso },
      }
    );

    return {
      date: dateIso,
      updated,
      loggedOut: 0,
      studentIds: students.map((student) => student.id),
    };
  }
}
