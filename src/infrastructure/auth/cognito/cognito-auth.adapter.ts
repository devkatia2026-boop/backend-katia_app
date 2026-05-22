import type {
  IAuthProvider,
  SignUpInput,
  SignUpOutput,
  ConfirmSignUpInput,
  SignInInput,
  SignInOutput,
  ResetPasswordInput,
} from '../../../application/ports/auth-provider.port';
import type { AuthenticationResultType } from '@aws-sdk/client-cognito-identity-provider';
import { signUp as cognitoSignUp } from './signUp';
import { signIn as cognitoSignIn } from './sigIn';
import { refreshSession as cognitoRefreshSession } from './refreshSession';
import { confirmSignUp as cognitoConfirmSignUp } from './confirmSignUp';
import { resendConfirmationCode as cognitoResendConfirmationCode } from './resendConfirmationCode';
import {
  forgotPassword as cognitoForgotPassword,
  confirmForgotPassword as cognitoConfirmForgotPassword,
} from './forgotPassword';

function mapAuthenticationResult(auth: AuthenticationResultType | undefined): SignInOutput {
  if (!auth?.IdToken || !auth?.AccessToken) {
    throw new Error('Falha na autenticação.');
  }
  return {
    idToken: auth.IdToken,
    accessToken: auth.AccessToken,
    refreshToken: auth.RefreshToken,
    expiresIn: auth.ExpiresIn,
  };
}

/**
 * Adapter: implementa o port IAuthProvider usando AWS Cognito.
 * A camada de aplicação não conhece Cognito, apenas o port.
 */
export class CognitoAuthAdapter implements IAuthProvider {
  async signUp(input: SignUpInput): Promise<SignUpOutput> {
    const result = await cognitoSignUp({
      email: input.email,
      password: input.password,
      name: input.name,
      typeUser: input.typeUser,
    });
    return {
      userSub: result.UserSub ?? '',
    };
  }

  async confirmSignUp(input: ConfirmSignUpInput): Promise<void> {
    await cognitoConfirmSignUp({
      email: input.email,
      code: input.code,
    });
  }

  async resendSignUpConfirmationCode(email: string): Promise<void> {
    await cognitoResendConfirmationCode(email);
  }

  async signIn(input: SignInInput): Promise<SignInOutput> {
    const result = await cognitoSignIn({
      email: input.email,
      password: input.password,
    });
    return mapAuthenticationResult(result.AuthenticationResult);
  }

  async refreshSession(refreshToken: string): Promise<SignInOutput> {
    const result = await cognitoRefreshSession(refreshToken);
    return mapAuthenticationResult(result.AuthenticationResult);
  }

  async forgotPassword(email: string): Promise<void> {
    await cognitoForgotPassword(email);
  }

  async confirmForgotPassword(input: ResetPasswordInput): Promise<void> {
    await cognitoConfirmForgotPassword({
      email: input.email,
      code: input.code,
      newPassword: input.newPassword,
    });
  }
}
