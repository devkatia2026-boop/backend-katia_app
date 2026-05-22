import type { IAuthProvider, SignInOutput } from '../../ports/auth-provider.port';

export class RefreshSessionUseCase {
  constructor(private readonly authProvider: IAuthProvider) {}

  async execute(refreshToken: string): Promise<SignInOutput> {
    return this.authProvider.refreshSession(refreshToken);
  }
}
