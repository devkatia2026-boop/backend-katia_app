import type { SocialReportInput } from '../parsing/social-report-body.parsing';

export type SocialReportContext = {
  reporterStudentId: string;
  reporterName: string;
  trainerId: string;
  input: SocialReportInput;
  subjectSummary: string;
  detailLines: string[];
  notificationMessage: string;
  reportedName: string;
  contentPreview: string | null;
};

export interface ISocialReportNotifier {
  notifyTrainerReport(context: SocialReportContext): Promise<void>;
}
