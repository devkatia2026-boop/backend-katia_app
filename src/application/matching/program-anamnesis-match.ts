import type { AnamnesisDTO } from '../ports/student-anamnesis.port';
import type { ProgramDTO } from '../ports/programs.port';

export type ProgramAnamnesisMatchCriteria = {
  type: boolean;
  level: boolean;
  objective: boolean;
  bother: boolean;
};

export type ProgramAnamnesisMatchEvaluation = {
  match_count: number;
  total_criteria: number;
  matches: ProgramAnamnesisMatchCriteria;
};

export type ProgramAnamnesisComparable = Pick<
  ProgramDTO,
  'type' | 'level' | 'objective' | 'bother'
>;

export type AnamnesisProgramComparable = Pick<
  AnamnesisDTO,
  'place_training' | 'level_experience' | 'main_objective' | 'bother'
>;

const TOTAL_CRITERIA = 4;

function normalizeComparable(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  return trimmed.toLocaleLowerCase('pt-BR');
}

function firstMuscle(value: string | null | undefined): string | null {
  if (value == null) return null;
  const first = value.split(',')[0]?.trim() ?? '';
  if (first.length === 0) return null;
  return first.toLocaleLowerCase('pt-BR');
}

function fieldsEqual(
  programValue: string | null | undefined,
  anamnesisValue: string | null | undefined
): boolean {
  const left = normalizeComparable(programValue);
  const right = normalizeComparable(anamnesisValue);
  if (left === null || right === null) return false;
  return left === right;
}

function botherFirstMuscleMatches(
  programBother: string | null | undefined,
  anamnesisBother: string | null | undefined
): boolean {
  const left = firstMuscle(programBother);
  const right = firstMuscle(anamnesisBother);
  if (left === null || right === null) return false;
  return left === right;
}

export function evaluateProgramAnamnesisMatch(
  program: ProgramAnamnesisComparable,
  anamnesis: AnamnesisProgramComparable
): ProgramAnamnesisMatchEvaluation {
  const matches: ProgramAnamnesisMatchCriteria = {
    type: fieldsEqual(program.type, anamnesis.place_training),
    level: fieldsEqual(program.level, anamnesis.level_experience),
    objective: fieldsEqual(program.objective, anamnesis.main_objective),
    bother: botherFirstMuscleMatches(program.bother, anamnesis.bother),
  };

  const match_count = Object.values(matches).filter(Boolean).length;

  return {
    match_count,
    total_criteria: TOTAL_CRITERIA,
    matches,
  };
}

export function sortProgramsByAnamnesisMatch<T extends { match_count: number; created_at: Date }>(
  items: T[]
): T[] {
  return [...items].sort((left, right) => {
    if (right.match_count !== left.match_count) {
      return right.match_count - left.match_count;
    }
    const leftTime = new Date(left.created_at).getTime();
    const rightTime = new Date(right.created_at).getTime();
    if (rightTime !== leftTime) return rightTime - leftTime;
    return 0;
  });
}
