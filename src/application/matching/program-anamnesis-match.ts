import { isAllProgramLevels, normalizeProgramLevel } from '../domain/program-levels';
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

function normalizeTrainingPlace(value: string | null | undefined): string | null {
  const normalized = normalizeComparable(value);
  if (normalized === null) return null;
  if (normalized === 'ambos' || normalized === 'casa/academia') {
    return 'casa/academia';
  }
  return normalized;
}

function typeMatches(
  programType: string | null | undefined,
  anamnesisPlace: string | null | undefined
): boolean {
  const left = normalizeTrainingPlace(programType);
  const right = normalizeTrainingPlace(anamnesisPlace);
  if (left === null || right === null) return false;
  return left === right;
}

function splitComparableList(value: string | null | undefined): string[] {
  if (value == null) return [];
  return value
    .split(/\s*,\s*/)
    .map((part) => normalizeComparable(part))
    .filter((part): part is string => part !== null);
}

function comparableListsOverlap(
  leftValues: string | null | undefined,
  rightValues: string | null | undefined
): boolean {
  const left = splitComparableList(leftValues);
  const right = splitComparableList(rightValues);
  if (left.length === 0 || right.length === 0) return false;
  const leftSet = new Set(left);
  return right.some((value) => leftSet.has(value));
}

function objectiveMatches(
  programObjective: string | null | undefined,
  anamnesisObjective: string | null | undefined
): boolean {
  return comparableListsOverlap(programObjective, anamnesisObjective);
}

function levelMatches(
  programLevel: string | null | undefined,
  anamnesisLevel: string | null | undefined
): boolean {
  if (isAllProgramLevels(programLevel)) {
    const anamnesis = normalizeComparable(anamnesisLevel);
    return anamnesis !== null;
  }

  const program = normalizeProgramLevel(programLevel ?? '');
  const anamnesis = normalizeComparable(anamnesisLevel);
  if (anamnesis === null || program.length === 0) return false;
  return program === anamnesis;
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
    type: typeMatches(program.type, anamnesis.place_training),
    level: levelMatches(program.level, anamnesis.level_experience),
    objective: objectiveMatches(program.objective, anamnesis.main_objective),
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
