import { changePassword as cognitoChangePassword } from '../../../infrastructure/auth/cognito/changePassword';
import { parseChangePasswordBody } from '../../parsing/change-password-body.parsing';

export class ChangePasswordUseCase {
  async execute(accessToken: string, body: unknown): Promise<void> {
    const fields = parseChangePasswordBody(body);

    await cognitoChangePassword({
      accessToken,
      previousPassword: fields.currentPassword,
      newPassword: fields.newPassword,
    });
  }
}
