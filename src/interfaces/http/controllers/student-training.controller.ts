import type { Request, Response } from 'express';
import type { GetTodayTrainingUseCase } from '../../../application/use-cases/student/get-today-training.use-case';
import type { GetWeeklyTrainingScheduleUseCase } from '../../../application/use-cases/student/get-weekly-training-schedule.use-case';
import type { GetMonthlyTrainingCalendarUseCase } from '../../../application/use-cases/student/get-monthly-training-calendar.use-case';

const NOT_FOUND = 'NotFoundException';
const VALIDATION = 'ValidationException';

export class StudentTrainingController {
  constructor(
    private readonly getTodayTraining: GetTodayTrainingUseCase,
    private readonly getWeeklyTrainingSchedule: GetWeeklyTrainingScheduleUseCase,
    private readonly getMonthlyTrainingCalendar: GetMonthlyTrainingCalendarUseCase
  ) {}

  async getToday(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.authUser!.sub;
      const result = await this.getTodayTraining.execute(studentId);
      res.status(200).json(result);
    } catch (err) {
      this.handleError(err, res, 'Erro ao obter treino de hoje.');
    }
  }

  async getWeek(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.authUser!.sub;
      const result = await this.getWeeklyTrainingSchedule.execute(studentId);
      res.status(200).json(result);
    } catch (err) {
      this.handleError(err, res, 'Erro ao obter treinos da semana.');
    }
  }

  async getCalendar(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.authUser!.sub;
      const result = await this.getMonthlyTrainingCalendar.execute(
        studentId,
        req.query.month,
        req.query.year
      );
      res.status(200).json(result);
    } catch (err) {
      this.handleError(err, res, 'Erro ao obter calendário mensal de treinos.');
    }
  }

  private handleError(err: unknown, res: Response, fallback: string): void {
    const error = err as { name?: string; message?: string };
    if (error.name === NOT_FOUND) {
      res.status(404).json({ message: error.message ?? 'Não encontrado.' });
      return;
    }
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Dados inválidos.' });
      return;
    }
    res.status(500).json({ message: fallback });
  }
}
