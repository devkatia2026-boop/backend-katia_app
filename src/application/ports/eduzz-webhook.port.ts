export type EduzzStudentPlanPaidValues = {
  type_plan: 'comum' | 'exclusive';
  validation: 'sim';
  validation_plan: string;
};

export type EduzzStudentPlanClearedValues = {
  type_plan: null;
  validation: 'nao';
  validation_plan: null;
};

export interface IEduzzStudentPlanRepository {
  findStudentIdByEmail(email: string): Promise<string | null>;
  applyPaidPlanByEmail(
    email: string,
    values: EduzzStudentPlanPaidValues
  ): Promise<{ student_id: string } | null>;
  clearPlanByEmail(email: string): Promise<{ student_id: string } | null>;
}
