import type { StudentPlanRankingType } from '../parsing/ranking.parsing';

export type RankingChampionNotifyInput = {
  plan: StudentPlanRankingType;
  month: number;
  year: number;
  winnerStudentId: string;
  winnerName: string;
  winnerTrainerId: string;
};

export interface IRankingChampionNotifier {
  notifyLastMonthChampion(input: RankingChampionNotifyInput): Promise<number>;
}
