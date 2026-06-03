import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoConfig } from './config';

function readAwsCredentials() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();

  if (!accessKeyId || !secretAccessKey) {
    return undefined;
  }

  return { accessKeyId, secretAccessKey };
}

const awsCredentials = readAwsCredentials();

export const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION?.trim() || cognitoConfig.region,
  ...(awsCredentials ? { credentials: awsCredentials } : {}),
});
