import type { DatabaseModels } from './models';
import type { ITrainerSettingsRepository } from '../../application/ports/trainer-settings.port';

export class SequelizeTrainerSettingsRepository implements ITrainerSettingsRepository {
  constructor(private readonly models: Pick<DatabaseModels, 'Trainer' | 'Student'>) {}

  async getSemesterPromotion(
    trainerId: string
  ): Promise<{ semester_promotion: boolean } | null> {
    const row = await this.models.Trainer.findByPk(trainerId, {
      attributes: ['semester_promotion'],
    });
    if (!row) return null;
    return { semester_promotion: Boolean(row.get('semester_promotion')) };
  }

  async getSemesterPromotionForStudent(
    studentId: string
  ): Promise<{ semester_promotion: boolean } | null> {
    const student = await this.models.Student.findByPk(studentId, {
      attributes: ['trainer_id'],
    });
    if (!student) return null;
    const trainerId = String(student.get('trainer_id'));
    return this.getSemesterPromotion(trainerId);
  }

  async updateSemesterPromotion(trainerId: string, semesterPromotion: boolean): Promise<void> {
    const [affected] = await this.models.Trainer.update(
      { semester_promotion: semesterPromotion },
      { where: { id: trainerId } }
    );
    if (affected === 0) {
      const err = new Error('Treinador não encontrado.');
      err.name = 'TrainerNotFoundException';
      throw err;
    }
  }
}
