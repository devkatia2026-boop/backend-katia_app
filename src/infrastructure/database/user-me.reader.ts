import type { IUserMeReader, MeResult } from '../../application/ports/user-me-reader.port';
import type { DatabaseModels } from './models';

function omitSensitiveProfileFields<T extends Record<string, unknown>>(row: T): T {
  const copy = { ...row };
  delete copy.refresh_token;
  delete copy.expo_push_token;
  return copy;
}

export class SequelizeUserMeReader implements IUserMeReader {
  constructor(private readonly models: Pick<DatabaseModels, 'Trainer' | 'Student'>) {}

  async findByCognitoId(cognitoSub: string): Promise<MeResult | null> {
    const trainer = await this.models.Trainer.findByPk(cognitoSub);
    if (trainer) {
      return {
        role: 'trainer',
        profile: omitSensitiveProfileFields(trainer.toJSON() as Record<string, unknown>),
      };
    }

    const student = await this.models.Student.findByPk(cognitoSub);
    if (student) {
      return {
        role: 'student',
        profile: omitSensitiveProfileFields(student.toJSON() as Record<string, unknown>),
      };
    }

    return null;
  }
}
