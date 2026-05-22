import type { DatabaseModels } from './models';
import type {
  IUserProfileUpdater,
  StudentProfileUpdateValues,
  TrainerProfileUpdateValues,
} from '../../application/ports/user-profile-updater.port';

export class SequelizeUserProfileUpdater implements IUserProfileUpdater {
  constructor(private readonly models: Pick<DatabaseModels, 'Trainer' | 'Student'>) {}

  async updateTrainerProfile(id: string, values: TrainerProfileUpdateValues): Promise<void> {
    const [affected] = await this.models.Trainer.update(values, { where: { id } });
    if (affected === 0) {
      const err = new Error('Treinador não encontrado.');
      err.name = 'ProfileNotFoundException';
      throw err;
    }
  }

  async updateStudentProfile(id: string, values: StudentProfileUpdateValues): Promise<void> {
    const [affected] = await this.models.Student.update(values, { where: { id } });
    if (affected === 0) {
      const err = new Error('Aluno não encontrado.');
      err.name = 'ProfileNotFoundException';
      throw err;
    }
  }
}
