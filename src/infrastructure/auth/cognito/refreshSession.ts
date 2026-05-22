import { InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from './client';
import { cognitoConfig } from './config';

export async function refreshSession(refreshToken: string) {
  const command = new InitiateAuthCommand({
    AuthFlow: 'REFRESH_TOKEN_AUTH',
    ClientId: cognitoConfig.clientId,
    AuthParameters: {
      REFRESH_TOKEN: refreshToken,
    },
  });

  return cognitoClient.send(command);
}
