import type { IAuthProvider } from '../../ports/auth-provider.port';
import type { IUserProfileWriter } from '../../ports/user-profile-writer.port';
import type { INewStudentRegistrationNotifier } from '../../ports/new-student-registration-notifier.port';
import { parseOptionalBrazilDisplayPhone } from '../../parsing/register-phone.parsing';

export type RegisterUserProfileType = 'student' | 'trainer';

export interface RegisterUserProfileInput {
  email: string;
  password: string;
  name: string;
  typeUser: RegisterUserProfileType;
  /** Obrigatório apenas quando `typeUser` é `student`. */
  trainerId?: string;
  /** Opcional — formato `(XX) número`; gravado apenas em trainers/students, não Cognito. */
  phone?: unknown;
}

export interface RegisterUserProfileOutput {
  userSub: string;
  typeUser: RegisterUserProfileType;
}

export class RegisterUserProfileUseCase {
  constructor(
    private readonly authProvider: IAuthProvider,
    private readonly userProfileWriter: IUserProfileWriter,
    private readonly newStudentRegistrationNotifier: INewStudentRegistrationNotifier
  ) {}

  async execute(input: RegisterUserProfileInput): Promise<RegisterUserProfileOutput> {
    const phone = parseOptionalBrazilDisplayPhone(input.phone);

    const studentTrainerId =
      input.typeUser === 'student' ? input.trainerId?.trim() : undefined;

    if (input.typeUser === 'student') {
      if (!studentTrainerId) {
        const err = new Error('trainer_id é obrigatório para cadastro como aluno.');
        err.name = 'ValidationException';
        throw err;
      }
      const trainerOk = await this.userProfileWriter.trainerExistsById(studentTrainerId);
      if (!trainerOk) {
        const err = new Error('Treinador não encontrado.');
        err.name = 'TrainerNotFoundException';
        throw err;
      }
    }

    const { userSub } = await this.authProvider.signUp({
      email: input.email,
      password: input.password,
      name: input.name,
      typeUser: input.typeUser,
    });

    if (!userSub) {
      throw new Error('Cadastro no provedor de autenticação não retornou o identificador do usuário.');
    }

    if (input.typeUser === 'trainer') {
      await this.userProfileWriter.createTrainerProfile({
        id: userSub,
        email: input.email,
        fullName: input.name,
        phone,
      });
    } else {
      await this.userProfileWriter.createStudentProfile({
        id: userSub,
        trainerId: studentTrainerId!,
        email: input.email,
        fullName: input.name,
        phone,
      });
      await this.newStudentRegistrationNotifier.notifyNewStudentRegistered({
        trainerId: studentTrainerId!,
        studentId: userSub,
        studentName: input.name,
      });
    }

    return { userSub, typeUser: input.typeUser };
  }
}
