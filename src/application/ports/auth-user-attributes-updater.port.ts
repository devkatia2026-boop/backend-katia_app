export type CognitoUpdatableAttribute = 'email' | 'name' | 'phone_number';

export type AuthUserAttributesPatch = Partial<Record<CognitoUpdatableAttribute, string>>;

export interface IAuthUserAttributesUpdater {
  updateAttributes(accessToken: string, patch: AuthUserAttributesPatch): Promise<void>;
  deleteAttributes(accessToken: string, attributes: CognitoUpdatableAttribute[]): Promise<void>;
}

