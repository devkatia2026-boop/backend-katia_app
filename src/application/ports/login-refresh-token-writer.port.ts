import type { SignInOutput } from './auth-provider.port';

export interface ILoginRefreshTokenWriter {
  persistFromSignInResult(result: SignInOutput): Promise<void>;
}
