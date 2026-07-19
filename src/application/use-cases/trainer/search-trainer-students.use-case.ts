import type {
  ITrainerStudentsRepository,
  TrainerStudentSearchField,
} from '../../ports/trainer-students.port';
import { normalizePagination } from '../../parsing/pagination.parsing';
import { parseOptionalTrainerStudentPlan } from '../../parsing/trainer-student-plan.parsing';
import { parseOptionalTrainerStudentValidation } from '../../parsing/trainer-student-validation.parsing';

const VALIDATION = 'ValidationException';

export class SearchTrainerStudentsUseCase {
  constructor(private readonly trainerStudents: ITrainerStudentsRepository) {}

  execute(
    trainerId: string,
    field: unknown,
    q: unknown,
    validation: unknown,
    plan: unknown,
    page: unknown,
    pageSize: unknown
  ) {
    const validationFilter = parseOptionalTrainerStudentValidation(validation);
    const planFilter = parseOptionalTrainerStudentPlan(plan);
    const { page: p, pageSize: ps } = normalizePagination(page, pageSize);

    const hasField = field !== undefined && field !== null && field !== '';
    const hasQuery = q !== undefined && q !== null && q !== '';

    if (!validationFilter && !planFilter && (!hasField || !hasQuery)) {
      const err = new Error(
        'Informe "validation" (sim ou nao), "plan" (exclusive ou comum) ou os parâmetros "field" e "q" para pesquisar.'
      );
      err.name = VALIDATION;
      throw err;
    }

    if ((validationFilter || planFilter) && !hasField && !hasQuery) {
      return this.trainerStudents.listPaged(
        trainerId,
        p,
        ps,
        validationFilter,
        planFilter
      );
    }

    const f = this.parseField(field);
    const term = this.parseQuery(q);
    return this.trainerStudents.searchPaged(
      trainerId,
      f,
      term,
      p,
      ps,
      validationFilter,
      planFilter
    );
  }

  private parseField(field: unknown): TrainerStudentSearchField {
    if (field !== 'name' && field !== 'email') {
      const err = new Error('Parâmetro "field" deve ser "name" ou "email".');
      err.name = VALIDATION;
      throw err;
    }
    return field;
  }

  private parseQuery(q: unknown): string {
    if (typeof q !== 'string' || q.trim().length === 0) {
      const err = new Error('Parâmetro "q" (termo de busca) é obrigatório.');
      err.name = VALIDATION;
      throw err;
    }
    return q.trim();
  }
}
