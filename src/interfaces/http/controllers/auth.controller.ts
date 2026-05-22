import { Request, Response } from 'express';
import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize';
import type { RegisterUserProfileUseCase } from '../../../application/use-cases/auth/register-user-profile.use-case';
import type { ConfirmSignUpUseCase } from '../../../application/use-cases/auth/confirm-sign-up.use-case';
import type { SignInWithRefreshPersistenceUseCase } from '../../../application/use-cases/auth/sign-in-with-refresh-persistence.use-case';
import type { RefreshSessionUseCase } from '../../../application/use-cases/auth/refresh-session.use-case';
import type { ForgotPasswordUseCase } from '../../../application/use-cases/auth/forgot-password.use-case';
import type { ResetPasswordUseCase } from '../../../application/use-cases/auth/reset-password.use-case';
import type { ResendSignUpConfirmationUseCase } from '../../../application/use-cases/auth/resend-sign-up-confirmation.use-case';

const COGNITO_ERROR_STATUS: Record<string, number> = {
  NotAuthorizedException: 401,
  UserNotFoundException: 404,
  UserNotConfirmedException: 403,
  UsernameExistsException: 409,
  InvalidPasswordException: 400,
  InvalidParameterException: 400,
  CodeMismatchException: 400,
  ExpiredCodeException: 400,
  LimitExceededException: 429,
  TrainerNotFoundException: 404,
  ValidationException: 400,
};

function isBlank(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value !== 'string') return true;
  return value.trim().length === 0;
}

function formatMissingFieldsMessage(missing: string[]): string {
  if (missing.length === 0) return '';
  if (missing.length === 1) {
    return `Campo obrigatório ausente: ${missing[0]}.`;
  }
  return `Campos obrigatórios ausentes: ${missing.join(', ')}.`;
}

export class AuthController {
  constructor(
    private readonly registerUserProfileUseCase: RegisterUserProfileUseCase,
    private readonly confirmSignUpUseCase: ConfirmSignUpUseCase,
    private readonly signInUseCase: SignInWithRefreshPersistenceUseCase,
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly resendSignUpConfirmationUseCase: ResendSignUpConfirmationUseCase
  ) {}

  private handleError(err: unknown, res: Response, defaultMessage: string): void {
    const error = err as { name?: string; message?: string };
    const status = COGNITO_ERROR_STATUS[error.name ?? ''] ?? 400;
    res.status(status).json({
      message: error.message ?? defaultMessage,
    });
  }

  private handleRegisterProfileError(err: unknown, res: Response): void {
    if (err instanceof UniqueConstraintError) {
      res.status(409).json({ message: 'Conflito ao salvar o perfil no banco de dados.' });
      return;
    }
    if (err instanceof ForeignKeyConstraintError) {
      res.status(400).json({ message: 'Referência inválida ao salvar o perfil no banco de dados.' });
      return;
    }
    this.handleError(err, res, 'Erro ao registrar usuário.');
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, typeUser, trainer_id: trainerId } = req.body as {
        email?: string;
        password?: string;
        name?: string;
        typeUser?: string;
        trainer_id?: string;
      };

      const missing: string[] = [];
      if (isBlank(email)) missing.push('email');
      if (isBlank(password)) missing.push('password');
      if (isBlank(name)) missing.push('name');
      if (isBlank(typeUser)) missing.push('typeUser');

      if (missing.length > 0) {
        res.status(400).json({
          message: formatMissingFieldsMessage(missing),
          missing,
        });
        return;
      }

      const normalizedType = String(typeUser).trim().toLowerCase() as 'student' | 'trainer';
      if (normalizedType !== 'student' && normalizedType !== 'trainer') {
        res.status(400).json({
          message: 'typeUser deve ser "student" ou "trainer".',
          field: 'typeUser',
        });
        return;
      }

      if (normalizedType === 'student' && isBlank(trainerId)) {
        res.status(400).json({
          message: 'Campo obrigatório ausente: trainer_id.',
          missing: ['trainer_id'],
        });
        return;
      }

      const result = await this.registerUserProfileUseCase.execute({
        email: String(email).trim(),
        password: String(password),
        name: String(name).trim(),
        typeUser: normalizedType,
        trainerId:
          normalizedType === 'student' ? String(trainerId).trim() : undefined,
      });

      res.status(201).json({
        message: 'Usuário criado. Verifique o e-mail para confirmar o cadastro.',
        userSub: result.userSub,
        typeUser: result.typeUser,
      });
    } catch (err) {
      this.handleRegisterProfileError(err, res);
    }
  }

  async confirm(req: Request, res: Response): Promise<void> {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        res.status(400).json({ message: 'Email e código são obrigatórios.' });
        return;
      }
      await this.confirmSignUpUseCase.execute({ email, code });
      res.status(200).json({ message: 'Cadastro confirmado com sucesso.' });
    } catch (err) {
      this.handleError(err, res, 'Erro ao confirmar cadastro.');
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ message: 'Email e senha são obrigatórios.' });
        return;
      }
      const result = await this.signInUseCase.execute({ email, password });
      res.status(200).json(result);
    } catch (err) {
      this.handleError(err, res, 'Erro ao fazer login.');
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body as { refreshToken?: string };
      if (isBlank(refreshToken)) {
        res.status(400).json({
          message: formatMissingFieldsMessage(['refreshToken']),
          missing: ['refreshToken'],
        });
        return;
      }
      const result = await this.refreshSessionUseCase.execute(String(refreshToken).trim());
      res.status(200).json(result);
    } catch (err) {
      this.handleError(err, res, 'Erro ao renovar a sessão.');
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body as { email?: string };
      if (isBlank(email)) {
        res.status(400).json({
          message: formatMissingFieldsMessage(['email']),
          missing: ['email'],
        });
        return;
      }
      await this.forgotPasswordUseCase.execute(String(email).trim());
      res.status(200).json({
        message: 'Se o e-mail existir, você receberá um código para redefinir a senha.',
      });
    } catch (err) {
      this.handleError(err, res, 'Erro ao solicitar redefinição de senha.');
    }
  }

  /** Reenvia o código de recuperação de senha (mesma operação Cognito que forgot-password). */
  async resendForgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body as { email?: string };
      if (isBlank(email)) {
        res.status(400).json({
          message: formatMissingFieldsMessage(['email']),
          missing: ['email'],
        });
        return;
      }
      await this.forgotPasswordUseCase.execute(String(email).trim());
      res.status(200).json({
        message:
          'Se o e-mail existir, um novo código para redefinir a senha foi enviado (ou o anterior permanece válido, conforme o Cognito).',
      });
    } catch (err) {
      this.handleError(err, res, 'Erro ao reenviar código de recuperação de senha.');
    }
  }

  async resendSignUpConfirmation(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body as { email?: string };
      if (isBlank(email)) {
        res.status(400).json({
          message: formatMissingFieldsMessage(['email']),
          missing: ['email'],
        });
        return;
      }
      await this.resendSignUpConfirmationUseCase.execute(String(email).trim());
      res.status(200).json({
        message:
          'Se o e-mail existir e o cadastro ainda não estiver confirmado, um novo código foi enviado.',
      });
    } catch (err) {
      this.handleError(err, res, 'Erro ao reenviar código de confirmação de cadastro.');
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, code, newPassword } = req.body;
      if (!email || !code || !newPassword) {
        res.status(400).json({ message: 'Email, código e nova senha são obrigatórios.' });
        return;
      }
      await this.resetPasswordUseCase.execute({ email, code, newPassword });
      res.status(200).json({ message: 'Senha alterada com sucesso.' });
    } catch (err) {
      this.handleError(err, res, 'Erro ao redefinir senha.');
    }
  }
}
