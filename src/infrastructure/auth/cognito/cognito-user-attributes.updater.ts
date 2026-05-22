import type {
  AuthUserAttributesPatch,
  CognitoUpdatableAttribute,
  IAuthUserAttributesUpdater,
} from '../../../application/ports/auth-user-attributes-updater.port';
import { deleteUserAttributes, updateUserAttributes } from './updateUserAttributes';

export class CognitoUserAttributesUpdater implements IAuthUserAttributesUpdater {
  async updateAttributes(accessToken: string, patch: AuthUserAttributesPatch): Promise<void> {
    const normalized: Record<string, string> = {};
    for (const [k, v] of Object.entries(patch)) {
      if (typeof v === 'string' && v.trim().length > 0) {
        normalized[k] = v.trim();
      }
    }
    if (Object.keys(normalized).length === 0) return;
    await updateUserAttributes(accessToken, normalized);
  }

  async deleteAttributes(
    accessToken: string,
    attributes: CognitoUpdatableAttribute[]
  ): Promise<void> {
    if (attributes.length === 0) return;
    await deleteUserAttributes(accessToken, attributes);
  }
}

