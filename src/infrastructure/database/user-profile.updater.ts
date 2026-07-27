import type { DatabaseModels } from './models';
import type {
  IUserProfileUpdater,
  StudentProfileUpdateValues,
  TrainerProfileUpdateValues,
} from '../../application/ports/user-profile-updater.port';
import { applyWasExclusiveOnStudentProfileUpdate } from '../../application/student-plan/student-was-exclusive';
import { claimExpoPushToken } from './expo-push-token.claim';

export class SequelizeUserProfileUpdater implements IUserProfileUpdater {
  constructor(private readonly models: Pick<DatabaseModels, 'Trainer' | 'Student'>) {}

  async updateTrainerProfile(id: string, values: TrainerProfileUpdateValues): Promise<void> {
    const { expo_push_token, ...rest } = values;
    const hasTokenUpdate = expo_push_token !== undefined;
    const hasRest = Object.keys(rest).length > 0;

    if (!hasTokenUpdate && !hasRest) {
      return;
    }

    if (hasTokenUpdate) {
      await claimExpoPushToken(this.models, id, 'trainer', expo_push_token);
    }

    if (hasRest) {
      const [affected] = await this.models.Trainer.update(rest, { where: { id } });
      if (affected === 0) {
        const err = new Error('Treinador não encontrado.');
        err.name = 'ProfileNotFoundException';
        throw err;
      }
      return;
    }

    const row = await this.models.Trainer.findByPk(id, { attributes: ['id'] });
    if (!row) {
      const err = new Error('Treinador não encontrado.');
      err.name = 'ProfileNotFoundException';
      throw err;
    }
  }

  async updateStudentProfile(id: string, values: StudentProfileUpdateValues): Promise<void> {
    const { expo_push_token, ...rest } = values;
    const hasTokenUpdate = expo_push_token !== undefined;
    const hasRest = Object.keys(rest).length > 0;

    if (!hasTokenUpdate && !hasRest) {
      return;
    }

    if (hasTokenUpdate) {
      await claimExpoPushToken(this.models, id, 'student', expo_push_token);
    }

    if (hasRest) {
      const patch = applyWasExclusiveOnStudentProfileUpdate(rest);
      const [affected] = await this.models.Student.update(patch, { where: { id } });
      if (affected === 0) {
        const err = new Error('Aluno não encontrado.');
        err.name = 'ProfileNotFoundException';
        throw err;
      }
      return;
    }

    const row = await this.models.Student.findByPk(id, { attributes: ['id'] });
    if (!row) {
      const err = new Error('Aluno não encontrado.');
      err.name = 'ProfileNotFoundException';
      throw err;
    }
  }
}
