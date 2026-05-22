import {
  UpdateUserAttributesCommand,
  DeleteUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from './client';

export async function updateUserAttributes(accessToken: string, attributes: Record<string, string>) {
  await cognitoClient.send(
    new UpdateUserAttributesCommand({
      AccessToken: accessToken,
      UserAttributes: Object.entries(attributes).map(([Name, Value]) => ({ Name, Value })),
    })
  );
}

export async function deleteUserAttributes(accessToken: string, attributes: string[]) {
  await cognitoClient.send(
    new DeleteUserAttributesCommand({
      AccessToken: accessToken,
      UserAttributeNames: attributes,
    })
  );
}

