import {
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from './client';
import { cognitoConfig } from './config';

export async function forgotPassword(email: string) {
  const command = new ForgotPasswordCommand({
    ClientId: cognitoConfig.clientId,
    Username: email,
  });

  return cognitoClient.send(command);
}

export interface ConfirmForgotPasswordParams {
  email: string;
  code: string;
  newPassword: string;
}

export async function confirmForgotPassword({
  email,
  code,
  newPassword,
}: ConfirmForgotPasswordParams) {
  const command = new ConfirmForgotPasswordCommand({
    ClientId: cognitoConfig.clientId,
    Username: email,
    ConfirmationCode: code,
    Password: newPassword,
  });

  return cognitoClient.send(command);
}
