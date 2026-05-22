import { ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from './client';
import { cognitoConfig } from './config';

export interface ConfirmSignUpParams {
  email: string;
  code: string;
}

export async function confirmSignUp({ email, code }: ConfirmSignUpParams) {
  const command = new ConfirmSignUpCommand({
    ClientId: cognitoConfig.clientId,
    Username: email,
    ConfirmationCode: code,
  });

  return cognitoClient.send(command);
}
