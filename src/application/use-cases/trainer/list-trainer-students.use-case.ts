import type { ITrainerStudentsRepository } from '../../ports/trainer-students.port';
import { normalizePagination } from '../../parsing/pagination.parsing';
import { parseOptionalTrainerStudentPlan } from '../../parsing/trainer-student-plan.parsing';
import { parseOptionalTrainerStudentValidation } from '../../parsing/trainer-student-validation.parsing';

export class ListTrainerStudentsUseCase {
  constructor(private readonly trainerStudents: ITrainerStudentsRepository) {}

  execute(
    trainerId: string,
    page: unknown,
    pageSize: unknown,
    validation: unknown,
    plan: unknown
  ) {
    const { page: p, pageSize: ps } = normalizePagination(page, pageSize);
    const validationFilter = parseOptionalTrainerStudentValidation(validation);
    const planFilter = parseOptionalTrainerStudentPlan(plan);
    return this.trainerStudents.listPaged(trainerId, p, ps, validationFilter, planFilter);
  }
}
