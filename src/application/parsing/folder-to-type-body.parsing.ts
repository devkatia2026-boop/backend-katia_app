import type {
  CreateFolderToTypeInput,
  FolderToTypeDTO,
  FolderToTypeKind,
  PatchFolderToTypeInput,
} from '../ports/folders-to-type.port';

const VALIDATION = 'ValidationException';

const FOLDER_TO_TYPE_KINDS: FolderToTypeKind[] = ['T', 'E', 'S'];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validationError(message: string): never {
  const err = new Error(message);
  err.name = VALIDATION;
  throw err;
}

function expectPositiveInt(value: unknown, field: string): number {
  let n: number;
  if (typeof value === 'number') n = value;
  else if (typeof value === 'string') n = parseInt(value, 10);
  else validationError(`Campo "${field}" deve ser um inteiro positivo.`);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) {
    validationError(`Campo "${field}" deve ser um inteiro positivo.`);
  }
  return n;
}

function expectFolderToTypeKind(value: unknown): FolderToTypeKind {
  if (typeof value !== 'string') {
    validationError('Campo "type" deve ser "T", "E" ou "S".');
  }
  const t = value.trim().toUpperCase();
  if (!FOLDER_TO_TYPE_KINDS.includes(t as FolderToTypeKind)) {
    validationError('Campo "type" deve ser "T", "E" ou "S".');
  }
  return t as FolderToTypeKind;
}

function resolveIdsForType(
  type: FolderToTypeKind,
  body: Record<string, unknown>
): Pick<CreateFolderToTypeInput, 'training_id' | 'exercise_id' | 'set_id'> {
  if (type === 'T') {
    if (!('training_id' in body)) {
      validationError('Campo "training_id" é obrigatório quando type é "T".');
    }
    return {
      training_id: expectPositiveInt(body.training_id, 'training_id'),
      exercise_id: null,
      set_id: null,
    };
  }
  if (type === 'E') {
    if (!('exercise_id' in body)) {
      validationError('Campo "exercise_id" é obrigatório quando type é "E".');
    }
    return {
      training_id: null,
      exercise_id: expectPositiveInt(body.exercise_id, 'exercise_id'),
      set_id: null,
    };
  }
  if (!('set_id' in body)) {
    validationError('Campo "set_id" é obrigatório quando type é "S".');
  }
  return {
    training_id: null,
    exercise_id: null,
    set_id: expectPositiveInt(body.set_id, 'set_id'),
  };
}

export function assertFolderToTypeConsistency(
  input: Pick<FolderToTypeDTO, 'type' | 'training_id' | 'exercise_id' | 'set_id'>
): void {
  if (input.type === 'T') {
    if (input.training_id === null || input.exercise_id !== null || input.set_id !== null) {
      validationError('Para type "T", informe apenas training_id.');
    }
    return;
  }
  if (input.type === 'E') {
    if (input.exercise_id === null || input.training_id !== null || input.set_id !== null) {
      validationError('Para type "E", informe apenas exercise_id.');
    }
    return;
  }
  if (input.set_id === null || input.training_id !== null || input.exercise_id !== null) {
    validationError('Para type "S", informe apenas set_id.');
  }
}

export function parseFolderToTypeCreateBody(body: unknown): CreateFolderToTypeInput {
  if (!isPlainObject(body)) {
    validationError('Corpo da requisição deve ser um objeto JSON.');
  }
  if (!('folder_id' in body) || !('type' in body)) {
    validationError('Campos "folder_id" e "type" são obrigatórios.');
  }
  const type = expectFolderToTypeKind(body.type);
  const folder_id = expectPositiveInt(body.folder_id, 'folder_id');
  const ids = resolveIdsForType(type, body);
  return { folder_id, type, ...ids };
}

export function parseFolderToTypePatchBody(body: unknown): PatchFolderToTypeInput {
  if (!isPlainObject(body)) {
    validationError('Corpo da requisição deve ser um objeto JSON.');
  }
  const patch: PatchFolderToTypeInput = {};
  let n = 0;
  if ('folder_id' in body) {
    patch.folder_id = expectPositiveInt(body.folder_id, 'folder_id');
    n++;
  }
  if ('type' in body) {
    patch.type = expectFolderToTypeKind(body.type);
    n++;
  }
  if ('training_id' in body) {
    patch.training_id =
      body.training_id === null ? null : expectPositiveInt(body.training_id, 'training_id');
    n++;
  }
  if ('exercise_id' in body) {
    patch.exercise_id =
      body.exercise_id === null ? null : expectPositiveInt(body.exercise_id, 'exercise_id');
    n++;
  }
  if ('set_id' in body) {
    patch.set_id = body.set_id === null ? null : expectPositiveInt(body.set_id, 'set_id');
    n++;
  }
  if (n === 0) {
    validationError('Envie ao menos um campo para atualizar.');
  }
  return patch;
}

export function mergeFolderToTypePatch(
  existing: FolderToTypeDTO,
  patch: PatchFolderToTypeInput
): CreateFolderToTypeInput {
  const merged: CreateFolderToTypeInput = {
    folder_id: patch.folder_id ?? existing.folder_id,
    type: patch.type ?? existing.type,
    training_id: patch.training_id !== undefined ? patch.training_id : existing.training_id,
    exercise_id: patch.exercise_id !== undefined ? patch.exercise_id : existing.exercise_id,
    set_id: patch.set_id !== undefined ? patch.set_id : existing.set_id,
  };
  assertFolderToTypeConsistency(merged);
  return merged;
}

export function parseOptionalFolderToTypeKindQuery(value: unknown): FolderToTypeKind | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return expectFolderToTypeKind(Array.isArray(value) ? value[0] : value);
}
