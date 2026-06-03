/**
 * Cognito Pre Sign-up — vincula Google à conta nativa (mesmo e-mail).
 * Runtime: Node.js 20.x | Handler: index.handler | Arquivo: index.mjs
 */
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminGetUserCommand,
  AdminLinkProviderForUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient({});

function parseIdentities(raw) {
  if (!raw) {
    return [];
  }

  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (error) {
    console.warn('Falha ao ler identities:', error);
    return [];
  }
}

function parseGoogleIdentity(event) {
  const userName = event.userName || '';
  const userNameMatch = userName.match(/^([^_]+)_(.+)$/i);

  if (userNameMatch && userNameMatch[1].toLowerCase() === 'google') {
    return {
      providerName: userNameMatch[1],
      providerUserId: userNameMatch[2],
    };
  }

  const identitiesRaw = event.request?.userAttributes?.identities;
  const identities = parseIdentities(identitiesRaw);
  const google = identities.find((item) => item.providerName?.toLowerCase() === 'google');

  if (google?.userId) {
    return {
      providerName: google.providerName || 'Google',
      providerUserId: String(google.userId),
    };
  }

  return null;
}

function isNativeUser(user) {
  const username = user.Username || '';
  return !/^google[_-]/i.test(username);
}

function enableAutoConfirm(event) {
  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;
  return event;
}

function nativeUserHasGoogleLinked(user, googleUserId) {
  const identities = parseIdentities(
    user.Attributes?.find((attribute) => attribute.Name === 'identities')?.Value,
  );

  return identities.some(
    (identity) =>
      identity.providerName?.toLowerCase() === 'google' &&
      String(identity.userId) === String(googleUserId),
  );
}

async function loadNativeUserIdentities(userPoolId, username) {
  const result = await client.send(
    new AdminGetUserCommand({
      UserPoolId: userPoolId,
      Username: username,
    }),
  );

  return parseIdentities(
    result.UserAttributes?.find((attribute) => attribute.Name === 'identities')?.Value,
  );
}

function isAlreadyLinkedError(message) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('already linked') ||
    normalized.includes('already exists') ||
    normalized.includes('aliasexists') ||
    normalized.includes('linking user')
  );
}

export const handler = async (event) => {
  console.log('PreSignUp event:', JSON.stringify(event));

  if (event.triggerSource !== 'PreSignUp_ExternalProvider') {
    return event;
  }

  const email = (event.request?.userAttributes?.email || '').trim().toLowerCase();
  if (!email) {
    return enableAutoConfirm(event);
  }

  const googleIdentity = parseGoogleIdentity(event);
  if (!googleIdentity) {
    console.warn('Identidade Google não identificada; segue cadastro federado padrão.');
    return enableAutoConfirm(event);
  }

  const listResult = await client.send(
    new ListUsersCommand({
      UserPoolId: event.userPoolId,
      Filter: `email = "${email}"`,
      Limit: 10,
    }),
  );

  const nativeUser = (listResult.Users || []).find(
    (user) => isNativeUser(user) && user.Enabled !== false,
  );

  if (!nativeUser?.Username) {
    console.log('Nenhuma conta nativa para o e-mail; novo cadastro Google permitido.');
    return enableAutoConfirm(event);
  }

  if (nativeUserHasGoogleLinked(nativeUser, googleIdentity.providerUserId)) {
    console.log(
      `Google ${googleIdentity.providerUserId} já vinculado a ${nativeUser.Username}; concluindo login.`,
    );
    return enableAutoConfirm(event);
  }

  const linkedIdentities = await loadNativeUserIdentities(event.userPoolId, nativeUser.Username);
  const alreadyLinked = linkedIdentities.some(
    (identity) =>
      identity.providerName?.toLowerCase() === 'google' &&
      String(identity.userId) === String(googleIdentity.providerUserId),
  );

  if (alreadyLinked) {
    console.log(
      `Google ${googleIdentity.providerUserId} já vinculado (AdminGetUser); concluindo login.`,
    );
    return enableAutoConfirm(event);
  }

  console.log(
    `Vinculando Google ${googleIdentity.providerUserId} → usuário nativo ${nativeUser.Username}`,
  );

  try {
    await client.send(
      new AdminLinkProviderForUserCommand({
        UserPoolId: event.userPoolId,
        DestinationUser: {
          ProviderName: 'Cognito',
          ProviderAttributeValue: nativeUser.Username,
        },
        SourceUser: {
          ProviderName: googleIdentity.providerName,
          ProviderAttributeName: 'Cognito_Subject',
          ProviderAttributeValue: googleIdentity.providerUserId,
        },
      }),
    );
    console.log('Vínculo concluído. Usuário deve autenticar novamente com Google.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (isAlreadyLinkedError(message)) {
      console.log('Google já estava vinculado; concluindo login:', message);
      return enableAutoConfirm(event);
    }

    console.error('Falha ao vincular conta Google:', message);
    throw error;
  }

  const retrySignal = new Error('GoogleAccountLinkedRetry');
  retrySignal.name = 'GoogleAccountLinkedRetry';
  throw retrySignal;
};
