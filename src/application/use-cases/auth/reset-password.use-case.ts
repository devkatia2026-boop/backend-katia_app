import type { IAuthProvider, ResetPasswordInput } from '../../ports/auth-provider.port';

export class ResetPasswordUseCase {
  constructor(private readonly authProvider: IAuthProvider) {}

  async execute(input: ResetPasswordInput): Promise<void> {
    return this.authProvider.confirmForgotPassword(input);
  }
}
