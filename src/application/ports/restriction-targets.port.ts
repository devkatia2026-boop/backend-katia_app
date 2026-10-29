export interface IRestrictionTargetsLookup {
  studentExists(studentId: string): Promise<boolean>;
  trainerExists(trainerId: string): Promise<boolean>;
  resolveDisplayName(
    userType: 'student' | 'trainer',
    userId: string
  ): Promise<string | null>;
  resolveDisplayNameMap(
    studentIds: string[],
    trainerIds: string[]
  ): Promise<Map<string, string>>;
}
