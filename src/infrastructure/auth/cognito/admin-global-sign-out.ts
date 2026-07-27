import { AdminUserGlobalSignOutCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from './client';
import { cognitoConfig } from './config';

export async function adminGlobalSignOut(username: string): Promise<void> {
  const command = new AdminUserGlobalSignOutCommand({
    UserPoolId: cognitoConfig.userPoolId,
    Username: username,
  });

  await cognitoClient.send(command);
}
