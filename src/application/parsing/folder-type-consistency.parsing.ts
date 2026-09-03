import type { FolderDTO, FolderKind } from '../ports/folders.port';

const VALIDATION = 'ValidationException';

function validationError(message: string): never {
  const err = new Error(message);
  err.name = VALIDATION;
  throw err;
}

export function assertFolderKindMatches(folder: FolderDTO, expected: FolderKind): void {
  if (folder.type !== expected) {
    validationError('A pasta não pertence a este tipo de biblioteca.');
  }
}
