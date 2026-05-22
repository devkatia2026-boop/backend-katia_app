import { SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from './client';
import { cognitoConfig } from './config';

export type CognitoTypeUser = 'student' | 'trainer';

export interface SignUpParams {
  email: string;
  password: string;
  name?: string;
  typeUser?: CognitoTypeUser;
}

export async function signUp({ email, password, name, typeUser }: SignUpParams) {
  const command = new SignUpCommand({
    ClientId: cognitoConfig.clientId,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: 'email', Value: email },
      ...(name ? [{ Name: 'name', Value: name }] : []),
      ...(typeUser ? [{ Name: 'custom:typeUser', Value: typeUser }] : []),
    ],
  });

  return cognitoClient.send(command);
}
