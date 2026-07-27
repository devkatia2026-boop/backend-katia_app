export type ExpireStudentPlansResult = {
  date: string;
  updated: number;
  loggedOut: number;
};

export type ExpireStudentPlansBatch = ExpireStudentPlansResult & {
  studentIds: string[];
};

export interface IStudentPlanExpirationRepository {
  expirePlansForDate(dateIso: string): Promise<ExpireStudentPlansBatch>;
}
