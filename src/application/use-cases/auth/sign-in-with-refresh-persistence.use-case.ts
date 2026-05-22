import type { IAuthProvider, SignInInput, SignInOutput } from '../../ports/auth-provider.port';
import type { ILoginRefreshTokenWriter } from '../../ports/login-refresh-token-writer.port';

export class SignInWithRefreshPersistenceUseCase {
  constructor(
    private readonly authProvider: IAuthProvider,
    private readonly refreshTokenWriter: ILoginRefreshTokenWriter
  ) {}

  async execute(input: SignInInput): Promise<SignInOutput> {
    const result = await this.authProvider.signIn(input);
    await this.refreshTokenWriter.persistFromSignInResult(result);
    return result;
  }
}
