import { parseOptionalUuid } from '../parsing/program-to-student-body.parsing';
import type { ProgramMatchAuth } from './student-match-profile';

const FORBIDDEN = 'ForbiddenException';

function sameStudentId(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

export function resolveProgramMatchStudentId(
  rawStudentId: unknown,
  auth: ProgramMatchAuth
): string {
  if (auth.role === 'student') {
    const studentId = parseOptionalUuid(rawStudentId, 'studentId');
    if (studentId !== undefined && !sameStudentId(studentId, auth.sub)) {
      const err = new Error('Você só pode consultar programas para a própria aluna.');
      err.name = FORBIDDEN;
      throw err;
    }
    return auth.sub;
  }

  const studentId = parseOptionalUuid(rawStudentId, 'studentId');
  if (studentId === undefined) {
    const err = new Error('Informe studentId.');
    err.name = FORBIDDEN;
    throw err;
  }
  return studentId;
}
