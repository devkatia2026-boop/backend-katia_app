import { ResendConfirmationCodeCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from './client';
import { cognitoConfig } from './config';

export async function resendConfirmationCode(email: string) {
  const command = new ResendConfirmationCodeCommand({
    ClientId: cognitoConfig.clientId,
    Username: email,
  });

  return cognitoClient.send(command);
}
