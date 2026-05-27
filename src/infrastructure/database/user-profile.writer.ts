import type { DatabaseModels } from './models';
import type {
  IUserProfileWriter,
  CreateTrainerProfileInput,
  CreateStudentProfileInput,
} from '../../application/ports/user-profile-writer.port';

export class SequelizeUserProfileWriter implements IUserProfileWriter {
  constructor(private readonly models: Pick<DatabaseModels, 'Trainer' | 'Student'>) {}

  async trainerExistsById(id: string): Promise<boolean> {
    const row = await this.models.Trainer.findByPk(id);
    return row !== null;
  }

  async createTrainerProfile(input: CreateTrainerProfileInput): Promise<void> {
    await this.models.Trainer.create({
      id: input.id,
      full_name: input.fullName,
      email: input.email,
      phone: input.phone,
    });
  }

  async createStudentProfile(input: CreateStudentProfileInput): Promise<void> {
    await this.models.Student.create({
      id: input.id,
      trainer_id: input.trainerId,
      full_name: input.fullName,
      email: input.email,
      phone: input.phone,
      birth: null,
      cpf: null,
      type_plan: null,
      height: null,
      weight: null,
    });
  }
}
