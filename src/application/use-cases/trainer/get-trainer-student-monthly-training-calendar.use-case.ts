import type { ITrainerStudentsRepository } from '../../ports/trainer-students.port';
import type {
  GetMonthlyTrainingCalendarResult,
  GetMonthlyTrainingCalendarUseCase,
} from '../student/get-monthly-training-calendar.use-case';
import { assertTrainerStudentAccess } from './assert-trainer-student-access';

export class GetTrainerStudentMonthlyTrainingCalendarUseCase {
  constructor(
    private readonly trainerStudents: ITrainerStudentsRepository,
    private readonly getMonthlyTrainingCalendar: GetMonthlyTrainingCalendarUseCase
  ) {}

  async execute(
    trainerId: string,
    studentId: string,
    month: unknown,
    year: unknown
  ): Promise<GetMonthlyTrainingCalendarResult> {
    await assertTrainerStudentAccess(this.trainerStudents, trainerId, studentId);
    return this.getMonthlyTrainingCalendar.execute(studentId, month, year);
  }
}
