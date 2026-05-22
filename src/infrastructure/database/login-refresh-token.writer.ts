import type { SignInOutput } from '../../application/ports/auth-provider.port';
import type { ILoginRefreshTokenWriter } from '../../application/ports/login-refresh-token-writer.port';
import type { DatabaseModels } from './models';
import { decodeCognitoIdTokenPayload } from '../auth/cognito/id-token-payload';

export class SequelizeLoginRefreshTokenWriter implements ILoginRefreshTokenWriter {
  constructor(private readonly models: Pick<DatabaseModels, 'Trainer' | 'Student'>) {}

  async persistFromSignInResult(result: SignInOutput): Promise<void> {
    if (!result.refreshToken?.trim() || !result.idToken) {
      return;
    }

    const payload = decodeCognitoIdTokenPayload(result.idToken);
    if (!payload) {
      return;
    }

    const sub = typeof payload.sub === 'string' ? payload.sub : '';
    if (!sub) {
      return;
    }

    const token = result.refreshToken.trim();
    const role = payload['custom:typeUser']?.trim().toLowerCase();

    if (role === 'trainer') {
      await this.models.Trainer.update({ refresh_token: token }, { where: { id: sub } });
      return;
    }
    if (role === 'student') {
      await this.models.Student.update({ refresh_token: token }, { where: { id: sub } });
      return;
    }

    const [trainerRows] = await this.models.Trainer.update(
      { refresh_token: token },
      { where: { id: sub } }
    );
    if (trainerRows > 0) {
      return;
    }
    await this.models.Student.update({ refresh_token: token }, { where: { id: sub } });
  }
}
