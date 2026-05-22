export const cognitoConfig = {
  userPoolId: process.env.COGNITO_USER_POOL_ID ?? '',
  clientId: process.env.COGNITO_CLIENT_ID ?? '',
  region: process.env.COGNITO_REGION ?? 'sa-east-1',
};
