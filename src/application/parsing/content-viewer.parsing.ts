export type ContentViewerRole = 'student' | 'trainer';

export function listActiveOnlyForRole(role: ContentViewerRole): boolean {
  return role === 'student';
}

export function assertActiveForStudent(status: boolean | null, message = 'Recurso não encontrado.'): void {
  if (status !== true) {
    const err = new Error(message);
    err.name = 'NotFoundException';
    throw err;
  }
}
