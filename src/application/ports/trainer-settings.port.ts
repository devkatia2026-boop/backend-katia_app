export interface ITrainerSettingsRepository {
  getSemesterPromotion(trainerId: string): Promise<{ semester_promotion: boolean } | null>;
  getSemesterPromotionForStudent(studentId: string): Promise<{ semester_promotion: boolean } | null>;
  updateSemesterPromotion(trainerId: string, semesterPromotion: boolean): Promise<void>;
}
