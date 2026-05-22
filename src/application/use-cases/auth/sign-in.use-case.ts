import type { IAuthProvider, SignInInput, SignInOutput } from '../../ports/auth-provider.port';

export class SignInUseCase {
  constructor(private readonly authProvider: IAuthProvider) {}

  async execute(input: SignInInput): Promise<SignInOutput> {
    return this.authProvider.signIn(input);
  }
}
