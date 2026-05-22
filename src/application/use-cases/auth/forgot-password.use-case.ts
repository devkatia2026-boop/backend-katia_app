import type { IAuthProvider } from '../../ports/auth-provider.port';

export class ForgotPasswordUseCase {
  constructor(private readonly authProvider: IAuthProvider) {}

  async execute(email: string): Promise<void> {
    return this.authProvider.forgotPassword(email);
  }
}
