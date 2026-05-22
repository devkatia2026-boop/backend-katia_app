/**
 * Decodifica o payload do idToken JWT do Cognito (sem verificar assinatura).
 * Usado apenas para ler `sub` e claims após resposta válida do InitiateAuth.
 */
export type CognitoIdTokenPayload = {
  sub?: string;
  'custom:typeUser'?: string;
};

export function decodeCognitoIdTokenPayload(idToken: string): CognitoIdTokenPayload | null {
  try {
    const parts = idToken.split('.');
    if (parts.length < 2) return null;
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(b64, 'base64').toString('utf8');
    return JSON.parse(json) as CognitoIdTokenPayload;
  } catch {
    return null;
  }
}
