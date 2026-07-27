import type { IStudentSessionInvalidator } from '../../../application/ports/student-session.port';
import { adminGlobalSignOut } from './admin-global-sign-out';

export class CognitoStudentSessionInvalidator implements IStudentSessionInvalidator {
  async signOutStudent(studentId: string): Promise<void> {
    await adminGlobalSignOut(studentId);
  }
}
