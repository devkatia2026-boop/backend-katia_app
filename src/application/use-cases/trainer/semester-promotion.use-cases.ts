import { parseSemesterPromotionPatchBody } from '../../parsing/semester-promotion-body.parsing';
import type { ITrainerSettingsRepository } from '../../ports/trainer-settings.port';

export class GetSemesterPromotionUseCase {
  constructor(private readonly settings: ITrainerSettingsRepository) {}

  async execute(
    viewerId: string,
    viewerRole: 'student' | 'trainer'
  ): Promise<{ semester_promotion: boolean }> {
    if (viewerRole === 'trainer') {
      const row = await this.settings.getSemesterPromotion(viewerId);
      if (!row) {
        const err = new Error('Treinador não encontrado.');
        err.name = 'TrainerNotFoundException';
        throw err;
      }
      return row;
    }

    const row = await this.settings.getSemesterPromotionForStudent(viewerId);
    if (!row) {
      const err = new Error('Aluna não encontrada.');
      err.name = 'StudentNotFoundException';
      throw err;
    }
    return row;
  }
}

export class UpdateSemesterPromotionUseCase {
  constructor(private readonly settings: ITrainerSettingsRepository) {}

  async execute(trainerId: string, body: unknown): Promise<{ semester_promotion: boolean }> {
    const { semester_promotion } = parseSemesterPromotionPatchBody(body);
    await this.settings.updateSemesterPromotion(trainerId, semester_promotion);
    const row = await this.settings.getSemesterPromotion(trainerId);
    if (!row) {
      const err = new Error('Treinador não encontrado.');
      err.name = 'TrainerNotFoundException';
      throw err;
    }
    return row;
  }
}
