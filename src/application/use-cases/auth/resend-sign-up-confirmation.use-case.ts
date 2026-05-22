import type { IAuthProvider } from '../../ports/auth-provider.port';

export class ResendSignUpConfirmationUseCase {
  constructor(private readonly authProvider: IAuthProvider) {}

  async execute(email: string): Promise<void> {
    return this.authProvider.resendSignUpConfirmationCode(email);
  }
}
