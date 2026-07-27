import { getBrazilDateContext } from '../../parsing/set-order-schedule.parsing';
import type {
  ExpireStudentPlansResult,
  IStudentPlanExpirationRepository,
} from '../../ports/student-plan-expiration.port';
import type { IStudentSessionInvalidator } from '../../ports/student-session.port';

export class ExpireStudentPlansUseCase {
  constructor(
    private readonly repository: IStudentPlanExpirationRepository,
    private readonly sessionInvalidator: IStudentSessionInvalidator
  ) {}

  async execute(referenceDate = new Date()): Promise<ExpireStudentPlansResult> {
    const todayIso = getBrazilDateContext(referenceDate).date;
    const batch = await this.repository.expirePlansForDate(todayIso);

    let loggedOut = 0;

    for (const studentId of batch.studentIds) {
      try {
        await this.sessionInvalidator.signOutStudent(studentId);
        loggedOut += 1;
      } catch (err) {
        console.error('[student-plan-expiration] falha ao deslogar aluna', studentId, err);
      }
    }

    return {
      date: batch.date,
      updated: batch.updated,
      loggedOut,
    };
  }
}
