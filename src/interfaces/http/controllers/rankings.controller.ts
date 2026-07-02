import type { Request, Response } from 'express';
import type { GetCurrentMonthRankingUseCase } from '../../../application/use-cases/rankings/get-current-month-ranking.use-case';
import type { GetLastMonthRankingChampionUseCase } from '../../../application/use-cases/rankings/get-last-month-ranking-champion.use-case';
import { parseStudentPlanRankingType } from '../../../application/parsing/ranking.parsing';

const VALIDATION = 'ValidationException';
const NOT_FOUND = 'NotFoundException';

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function parsePlanParam(raw: string | undefined): ReturnType<typeof parseStudentPlanRankingType> {
  const value = raw?.trim() ?? '';
  if (!value) {
    const err = new Error('Parâmetro plan inválido.');
    err.name = VALIDATION;
    throw err;
  }
  return parseStudentPlanRankingType(value);
}

export class RankingsController {
  constructor(
    private readonly getCurrentMonthRanking: GetCurrentMonthRankingUseCase,
    private readonly getLastMonthRankingChampion: GetLastMonthRankingChampionUseCase
  ) {}

  async getCurrentRanking(req: Request, res: Response): Promise<void> {
    try {
      const plan = parsePlanParam(firstParam(req.params.plan));
      const result = await this.getCurrentMonthRanking.execute(plan);
      res.status(200).json(result);
    } catch (err) {
      this.handle(err, res, 'Erro ao listar ranking.');
    }
  }

  async getLastMonthChampion(req: Request, res: Response): Promise<void> {
    try {
      const plan = parsePlanParam(firstParam(req.params.plan));
      const result = await this.getLastMonthRankingChampion.execute(plan);
      res.status(200).json(result);
    } catch (err) {
      this.handle(err, res, 'Erro ao obter campeã do mês passado.');
    }
  }

  private handle(err: unknown, res: Response, fallback: string): void {
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Parâmetro inválido.' });
      return;
    }
    if (error.name === NOT_FOUND) {
      res.status(404).json({ message: error.message ?? 'Não encontrado.' });
      return;
    }
    res.status(500).json({ message: fallback });
  }
}
