export type MeRole = 'trainer' | 'student';

export type MeResult =
  | { role: 'trainer'; profile: Record<string, unknown> }
  | { role: 'student'; profile: Record<string, unknown> };

export interface IUserMeReader {
  findByCognitoId(cognitoSub: string): Promise<MeResult | null>;
}
