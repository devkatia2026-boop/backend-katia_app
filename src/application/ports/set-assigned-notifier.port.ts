export type SetAssignedToStudentInput = {
  trainerId: string;
  studentId: string;
  trainerName: string;
  setsId: number;
};

export interface ISetAssignedNotifier {
  notifySetAssignedToStudent(input: SetAssignedToStudentInput): Promise<void>;
}
