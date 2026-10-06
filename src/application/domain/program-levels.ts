export const ALL_PROGRAM_LEVELS = 'todos os níveis';

export const PROGRAM_LEVEL_VALUES = [
  'iniciante',
  'intermediário',
  'avançado',
  ALL_PROGRAM_LEVELS,
] as const;

export type ProgramLevelValue = (typeof PROGRAM_LEVEL_VALUES)[number];

export const PROGRAM_LEVELS = new Set<string>(PROGRAM_LEVEL_VALUES);

export function normalizeProgramLevel(value: string): string {
  return value.trim().toLocaleLowerCase('pt-BR');
}

export function isAllProgramLevels(level: string | null | undefined): boolean {
  if (level == null) {
    return false;
  }

  const trimmed = level.trim();
  if (trimmed.length === 0) {
    return false;
  }

  return normalizeProgramLevel(trimmed) === ALL_PROGRAM_LEVELS;
}
