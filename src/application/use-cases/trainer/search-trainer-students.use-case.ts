import type {
  ITrainerStudentsRepository,
  TrainerStudentSearchField,
} from '../../ports/trainer-students.port';
import { normalizePagination } from '../../parsing/pagination.parsing';

const VALIDATION = 'ValidationException';

export class SearchTrainerStudentsUseCase {
  constructor(private readonly trainerStudents: ITrainerStudentsRepository) {}

  execute(
    trainerId: string,
    field: unknown,
    q: unknown,
    page: unknown,
    pageSize: unknown
  ) {
    const f = this.parseField(field);
    const term = this.parseQuery(q);
    const { page: p, pageSize: ps } = normalizePagination(page, pageSize);
    return this.trainerStudents.searchPaged(trainerId, f, term, p, ps);
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
