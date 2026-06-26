import type { ISetsToStudentsRepository, SetToStudentDTO } from '../../ports/sets-to-students.port';

const NOT_FOUND = 'NotFoundException';
const FORBIDDEN = 'ForbiddenException';

export type GetSetToStudentAuth = { role: 'student' | 'trainer'; sub: string };

export class GetSetToStudentUseCase {
  constructor(private readonly repo: ISetsToStudentsRepository) {}

  async execute(id: number, auth: GetSetToStudentAuth): Promise<SetToStudentDTO> {
    const row = await this.repo.findById(id);
    if (!row) {
      const err = new Error('Vínculo aluna↔set não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    if (auth.role === 'student' && row.student_id !== auth.sub) {
      const err = new Error('Você não pode acessar este vínculo.');
      err.name = FORBIDDEN;
      throw err;
    }
    return row;
  }
}
