import { InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from './client';
import { cognitoConfig } from './config';

export interface SignInParams {
  email: string;
  password: string;
}

export async function signIn({ email, password }: SignInParams) {
  const command = new InitiateAuthCommand({
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: cognitoConfig.clientId,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  });

  return cognitoClient.send(command);
}
