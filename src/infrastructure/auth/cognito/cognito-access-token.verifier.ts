import { CognitoJwtVerifier } from 'aws-jwt-verify';
import type { IAccessTokenVerifier } from '../../../application/ports/access-token-verifier.port';
import { cognitoConfig } from './config';

export class CognitoAccessTokenVerifier implements IAccessTokenVerifier {
  private readonly verifier = CognitoJwtVerifier.create({
    userPoolId: cognitoConfig.userPoolId,
    clientId: cognitoConfig.clientId,
    tokenUse: 'access',
  });

  async verify(accessToken: string): Promise<{ sub: string }> {
    const payload = await this.verifier.verify(accessToken);
    const sub = payload.sub;
    if (!sub) {
      throw new Error('Token sem identificador do usuário.');
    }
    return { sub };
  }
}
