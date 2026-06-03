import type { IUserProfileWriter } from '../../ports/user-profile-writer.port';
import type { IUserMeReader } from '../../ports/user-me-reader.port';
import type { INewStudentRegistrationNotifier } from '../../ports/new-student-registration-notifier.port';
import type { ILoginRefreshTokenWriter } from '../../ports/login-refresh-token-writer.port';
import { parseOptionalBrazilDisplayPhone } from '../../parsing/register-phone.parsing';

const EMAIL_ALREADY_REGISTERED = 'EmailAlreadyRegisteredException';
const TRAINER_NOT_FOUND = 'TrainerNotFoundException';
const PROFILE_NOT_FOUND = 'ProfileNotFoundException';
const VALIDATION = 'ValidationException';

export type GoogleAuthIntent = 'login' | 'signup';

export type ResolveGoogleAuthInput = {
  userSub: string;
  email: string;
  intent: GoogleAuthIntent;
  fullName?: string;
  trainerId?: string;
  phone?: unknown;
  idToken?: string;
  refreshToken?: string;
};

export type ResolveGoogleAuthOutput = {
  outcome: 'authenticated';
  alreadyRegistered: boolean;
  message: string;
};

export class ResolveGoogleAuthUseCase {
  constructor(
    private readonly userMeReader: IUserMeReader,
    private readonly userProfileWriter: IUserProfileWriter,
    private readonly newStudentRegistrationNotifier: INewStudentRegistrationNotifier,
    private readonly loginRefreshTokenWriter: ILoginRefreshTokenWriter
  ) {}

  async execute(input: ResolveGoogleAuthInput): Promise<ResolveGoogleAuthOutput> {
    const email = input.email.trim().toLowerCase();
    const userSub = input.userSub.trim();
    const intent = input.intent;

    if (!email || !userSub) {
      const err = new Error('Dados do Google incompletos.');
      err.name = VALIDATION;
      throw err;
    }

    const existingProfile = await this.userMeReader.findByCognitoId(userSub);
    if (existingProfile) {
      await this.persistOAuthSession(input);
      return {
        outcome: 'authenticated',
        alreadyRegistered: true,
        message: 'Sessão Google restaurada.',
      };
    }

    const studentByEmail = await this.userProfileWriter.findStudentByEmail(email);
    if (studentByEmail) {
      if (intent === 'signup') {
        const err = new Error(
          'Este e-mail já possui cadastro. Na tela de login, use "Continuar com Google" ou entre com e-mail e senha.'
        );
        err.name = EMAIL_ALREADY_REGISTERED;
        throw err;
      }

      const err = new Error(
        'Conta encontrada, mas o perfil não está vinculado a esta sessão. Tente "Continuar com Google" novamente ou use e-mail e senha.'
      );
      err.name = PROFILE_NOT_FOUND;
      throw err;
    }

    const trainerByEmail = await this.userProfileWriter.findTrainerByEmail(email);
    if (trainerByEmail) {
      const err = new Error('Este e-mail pertence a uma conta de treinadora.');
      err.name = EMAIL_ALREADY_REGISTERED;
      throw err;
    }

    if (intent === 'login') {
      const err = new Error(
        'Nenhuma conta vinculada a este Google. Cadastre-se ou entre com e-mail e senha.'
      );
      err.name = PROFILE_NOT_FOUND;
      throw err;
    }

    return this.createStudentProfile(input, email, userSub);
  }

  private async createStudentProfile(
    input: ResolveGoogleAuthInput,
    email: string,
    userSub: string
  ): Promise<ResolveGoogleAuthOutput> {
    const fullName = input.fullName?.trim() ?? '';
    const trainerId = input.trainerId?.trim() ?? '';

    if (!fullName) {
      const err = new Error('Nome completo é obrigatório para concluir o cadastro.');
      err.name = VALIDATION;
      throw err;
    }

    if (!trainerId) {
      const err = new Error('trainer_id é obrigatório para cadastro como aluno.');
      err.name = VALIDATION;
      throw err;
    }

    const trainerOk = await this.userProfileWriter.trainerExistsById(trainerId);
    if (!trainerOk) {
      const err = new Error('Treinador não encontrado.');
      err.name = TRAINER_NOT_FOUND;
      throw err;
    }

    const phone = parseOptionalBrazilDisplayPhone(input.phone);

    await this.userProfileWriter.createStudentProfile({
      id: userSub,
      trainerId,
      email,
      fullName,
      phone,
    });

    await this.newStudentRegistrationNotifier.notifyNewStudentRegistered({
      trainerId,
      studentId: userSub,
      studentName: fullName,
    });

    await this.persistOAuthSession(input);

    return {
      outcome: 'authenticated',
      alreadyRegistered: false,
      message: 'Cadastro com Google concluído com sucesso.',
    };
  }

  private async persistOAuthSession(input: ResolveGoogleAuthInput): Promise<void> {
    if (!input.refreshToken?.trim() || !input.idToken) {
      return;
    }

    await this.loginRefreshTokenWriter.persistFromSignInResult({
      idToken: input.idToken,
      accessToken: '',
      refreshToken: input.refreshToken.trim(),
      expiresIn: 0,
    });
  }
}
