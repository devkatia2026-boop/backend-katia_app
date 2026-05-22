/**
 * Port (interface) da camada de aplicação.
 * A infraestrutura (ex: Cognito) implementa esta interface.
 */

export type AuthUserType = 'student' | 'trainer';

export interface SignUpInput {
  email: string;
  password: string;
  name?: string;
  typeUser?: AuthUserType;
}

export interface SignUpOutput {
  userSub: string;
}

export interface ConfirmSignUpInput {
  email: string;
  code: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignInOutput {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface ResetPasswordInput {
  email: string;
  code: string;
  newPassword: string;
}

export interface IAuthProvider {
  signUp(input: SignUpInput): Promise<SignUpOutput>;
  confirmSignUp(input: ConfirmSignUpInput): Promise<void>;
  resendSignUpConfirmationCode(email: string): Promise<void>;
  signIn(input: SignInInput): Promise<SignInOutput>;
  refreshSession(refreshToken: string): Promise<SignInOutput>;
  forgotPassword(email: string): Promise<void>;
  confirmForgotPassword(input: ResetPasswordInput): Promise<void>;
}
