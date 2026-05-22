import type { IAuthProvider, ConfirmSignUpInput } from '../../ports/auth-provider.port';

export class ConfirmSignUpUseCase {
  constructor(private readonly authProvider: IAuthProvider) {}

  async execute(input: ConfirmSignUpInput): Promise<void> {
    return this.authProvider.confirmSignUp(input);
  }
}
