import type { IUserMeReader, MeResult } from '../../ports/user-me-reader.port';

export class GetMeUseCase {
  constructor(private readonly userMeReader: IUserMeReader) {}

  async execute(cognitoSub: string): Promise<MeResult> {
    const found = await this.userMeReader.findByCognitoId(cognitoSub);
    if (!found) {
      const err = new Error('Usuário não encontrado na base local.');
      err.name = 'ProfileNotFoundException';
      throw err;
    }
    return found;
  }
}
