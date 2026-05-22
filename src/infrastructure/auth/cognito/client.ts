import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoConfig } from './config';

export const cognitoClient = new CognitoIdentityProviderClient({
  region: cognitoConfig.region,
});
