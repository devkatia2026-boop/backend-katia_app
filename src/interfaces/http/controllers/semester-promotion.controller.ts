import type { Request, Response } from 'express';
import type {
  GetSemesterPromotionUseCase,
  UpdateSemesterPromotionUseCase,
} from '../../../application/use-cases/trainer/semester-promotion.use-cases';

const VALIDATION = 'ValidationException';
const NOT_FOUND = 'StudentNotFoundException';
const TRAINER_NOT_FOUND = 'TrainerNotFoundException';

export class SemesterPromotionController {
  constructor(
    private readonly getSemesterPromotion: GetSemesterPromotionUseCase,
    private readonly updateSemesterPromotion: UpdateSemesterPromotionUseCase
  ) {}

  async get(req: Request, res: Response): Promise<void> {
    try {
      const viewerId = req.authUser!.sub;
      const viewerRole = req.authUser!.role as 'student' | 'trainer';
      const result = await this.getSemesterPromotion.execute(viewerId, viewerRole);
      res.status(200).json(result);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Aluna não encontrada.' });
        return;
      }
      if (error.name === TRAINER_NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Treinador não encontrado.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao obter promoção semestral.' });
    }
  }

  async patch(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = req.authUser!.sub;
      const result = await this.updateSemesterPromotion.execute(trainerId, req.body);
      res.status(200).json(result);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === VALIDATION) {
        res.status(400).json({ message: error.message ?? 'Dados inválidos.' });
        return;
      }
      if (error.name === TRAINER_NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Treinador não encontrado.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao atualizar promoção semestral.' });
    }
  }
}
