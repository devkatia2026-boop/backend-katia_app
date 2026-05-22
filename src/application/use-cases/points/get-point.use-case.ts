import type { IPointsRepository, PointDTO } from '../../ports/points.port';

const NOT_FOUND = 'NotFoundException';
const FORBIDDEN = 'ForbiddenException';

export class GetPointUseCase {
  constructor(private readonly repo: IPointsRepository) {}

  async execute(
    id: number,
    auth: { role: 'student' | 'trainer'; sub: string }
  ): Promise<PointDTO> {
    const row = await this.repo.findById(id);
    if (!row) {
      const err = new Error('Registro não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    if (auth.role === 'student') {
      if (row.student_id !== auth.sub) {
        const err = new Error('Você não pode acessar este registro.');
        err.name = FORBIDDEN;
        throw err;
      }
      return { ...row, student: null };
    }
    const brief = await this.repo.getStudentTrainerBrief(row.student_id);
    if (!brief || brief.trainer_id !== auth.sub) {
      const err = new Error('Este registro não é de uma aluna sua.');
      err.name = FORBIDDEN;
      throw err;
    }
    return row;
  }
}
