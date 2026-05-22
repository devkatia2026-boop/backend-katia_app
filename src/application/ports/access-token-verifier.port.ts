export interface IAccessTokenVerifier {
  verify(accessToken: string): Promise<{ sub: string }>;
}
