import type { StudentPlanRankingType } from '../parsing/ranking.parsing';

export type RankingStudentBrief = {
  id: string;
  full_name: string;
  photo_perfil: string | null;
  trainer_id: string;
  type_plan: string | null;
};

export type RankingEntry = {
  rank: number;
  student: RankingStudentBrief;
  trainings_count: number;
  points: number;
};

export type MonthlyRankingResult = {
  plan: StudentPlanRankingType;
  month: number;
  year: number;
  month_start: string;
  month_end: string;
  points_per_training: number;
  leader: RankingEntry | null;
  items: RankingEntry[];
};

export type MonthlyRankingChampionResult = {
  plan: StudentPlanRankingType;
  month: number;
  year: number;
  month_start: string;
  month_end: string;
  points_per_training: number;
  champion: RankingEntry | null;
};

export interface IRankingsRepository {
  listMonthlyRankingByPlan(
    plan: StudentPlanRankingType,
    monthStart: string,
    monthEnd: string
  ): Promise<RankingEntry[]>;
  listStudentsByPlan(plan: StudentPlanRankingType): Promise<
    Array<{
      id: string;
      full_name: string;
      trainer_id: string;
      expo_push_token: string | null;
    }>
  >;
  hasAnnouncementForPlanMonth(
    plan: StudentPlanRankingType,
    month: number,
    year: number
  ): Promise<boolean>;
}
