import { adminDeleteUser } from '../../../infrastructure/auth/cognito/deleteUser';
import type { IStudentAccountRepository } from '../../ports/student-account.port';

const FORBIDDEN = 'ForbiddenException';

export class DeleteStudentAccountUseCase {
  constructor(private readonly accountRepo: IStudentAccountRepository) {}

  async execute(auth: { role: 'student' | 'trainer'; sub: string }): Promise<void> {
    if (auth.role !== 'student') {
      const err = new Error('Somente alunas podem excluir a própria conta.');
      err.name = FORBIDDEN;
      throw err;
    }

    await this.accountRepo.deleteAllDataForStudent(auth.sub);
    await adminDeleteUser(auth.sub);
  }
}
