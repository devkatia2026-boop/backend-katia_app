import { ChangePasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from './client';

export type ChangePasswordParams = {
  accessToken: string;
  previousPassword: string;
  newPassword: string;
};

export async function changePassword({
  accessToken,
  previousPassword,
  newPassword,
}: ChangePasswordParams): Promise<void> {
  const command = new ChangePasswordCommand({
    AccessToken: accessToken,
    PreviousPassword: previousPassword,
    ProposedPassword: newPassword,
  });

  await cognitoClient.send(command);
}
