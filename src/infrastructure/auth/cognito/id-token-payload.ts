export type CognitoIdentityRecord = {
  userId?: string;
  providerName?: string;
};

export type CognitoIdTokenPayload = {
  sub?: string;
  email?: string;
  'cognito:username'?: string;
  'custom:typeUser'?: string;
  identities?: string | CognitoIdentityRecord[];
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

export function extractGoogleSubjectFromIdToken(idToken: string): string | null {
  const payload = decodeCognitoIdTokenPayload(idToken);
  if (!payload) return null;

  const rawIdentities = payload.identities;
  if (rawIdentities) {
    try {
      const identities =
        typeof rawIdentities === 'string'
          ? (JSON.parse(rawIdentities) as CognitoIdentityRecord[])
          : rawIdentities;

      const googleIdentity = identities.find(
        (item) => item.providerName?.toLowerCase() === 'google' && item.userId
      );
      if (googleIdentity?.userId) {
        return googleIdentity.userId;
      }
    } catch {
      // Ignora JSON inválido em identities.
    }
  }

  const username = payload['cognito:username'] ?? payload.sub ?? '';
  if (username.startsWith('google_')) {
    return username.slice('google_'.length);
  }

  return null;
}

export function extractCognitoUsernameFromIdToken(idToken: string): string | null {
  const payload = decodeCognitoIdTokenPayload(idToken);
  if (!payload) return null;

  const username = payload['cognito:username'] ?? payload.sub;
  return typeof username === 'string' && username.trim() ? username.trim() : null;
}
