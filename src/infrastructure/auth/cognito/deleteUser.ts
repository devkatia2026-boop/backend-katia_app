import { AdminDeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from './client';
import { cognitoConfig } from './config';

export async function adminDeleteUser(username: string): Promise<void> {
  const command = new AdminDeleteUserCommand({
    UserPoolId: cognitoConfig.userPoolId,
    Username: username,
  });

  await cognitoClient.send(command);
}
