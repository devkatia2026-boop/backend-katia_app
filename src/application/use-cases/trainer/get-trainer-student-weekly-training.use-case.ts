import type { ITrainerStudentsRepository } from '../../ports/trainer-students.port';
import type {
  GetWeeklyTrainingScheduleResult,
  GetWeeklyTrainingScheduleUseCase,
} from '../student/get-weekly-training-schedule.use-case';
import { assertTrainerStudentAccess } from './assert-trainer-student-access';

export class GetTrainerStudentWeeklyTrainingUseCase {
  constructor(
    private readonly trainerStudents: ITrainerStudentsRepository,
    private readonly getWeeklyTrainingSchedule: GetWeeklyTrainingScheduleUseCase
  ) {}

  async execute(trainerId: string, studentId: string): Promise<GetWeeklyTrainingScheduleResult> {
    await assertTrainerStudentAccess(this.trainerStudents, trainerId, studentId);
    return this.getWeeklyTrainingSchedule.execute(studentId);
  }
}
