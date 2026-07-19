import type { Request, Response } from 'express';
import { UniqueConstraintError } from 'sequelize';
import type { ListTrainerStudentsUseCase } from '../../../application/use-cases/trainer/list-trainer-students.use-case';
import type { SearchTrainerStudentsUseCase } from '../../../application/use-cases/trainer/search-trainer-students.use-case';
import type { GetTrainerStudentsValidationSummaryUseCase } from '../../../application/use-cases/trainer/get-trainer-students-validation-summary.use-case';
import type { GetTrainerStudentUseCase } from '../../../application/use-cases/trainer/get-trainer-student.use-case';
import type { UpdateTrainerStudentUseCase } from '../../../application/use-cases/trainer/update-trainer-student.use-case';
import type { DeleteTrainerStudentAnamnesisUseCase } from '../../../application/use-cases/trainer/delete-trainer-student-anamnesis.use-case';
import type { ListTrainerStudentPhysicalsUseCase } from '../../../application/use-cases/trainer/list-trainer-student-physicals.use-case';
import type { ListTrainerStudentEvolutionsUseCase } from '../../../application/use-cases/trainer/list-trainer-student-evolutions.use-case';
import type { ListTrainerStudentsAnamnesesUseCase } from '../../../application/use-cases/trainer/list-trainer-students-anamneses.use-case';
import type { GetTrainerStudentAnamnesisUseCase } from '../../../application/use-cases/trainer/get-trainer-student-anamnesis.use-case';
import type { ListTrainerStudentAnamnesisHistoryUseCase } from '../../../application/use-cases/trainer/list-trainer-student-anamnesis-history.use-case';
import type { GetTrainerStudentWeeklyTrainingUseCase } from '../../../application/use-cases/trainer/get-trainer-student-weekly-training.use-case';
import type { GetTrainerStudentMonthlyTrainingCalendarUseCase } from '../../../application/use-cases/trainer/get-trainer-student-monthly-training-calendar.use-case';
import type { CopyStudentTrainingPhasesUseCase } from '../../../application/use-cases/trainer/copy-student-training-phases.use-case';

const VALIDATION = 'ValidationException';
const NOT_FOUND = 'StudentNotFoundException';
const FORBIDDEN = 'ForbiddenException';
const ANAMNESIS_NOT_FOUND = 'AnamnesisNotFoundException';

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function firstQuery(value: unknown): unknown {
  if (Array.isArray(value)) return value[0];
  return value;
}

export class TrainerStudentsController {
  constructor(
    private readonly listTrainerStudents: ListTrainerStudentsUseCase,
    private readonly searchTrainerStudents: SearchTrainerStudentsUseCase,
    private readonly getTrainerStudentsValidationSummary: GetTrainerStudentsValidationSummaryUseCase,
    private readonly getTrainerStudent: GetTrainerStudentUseCase,
    private readonly updateTrainerStudent: UpdateTrainerStudentUseCase,
    private readonly deleteTrainerStudentAnamnesis: DeleteTrainerStudentAnamnesisUseCase,
    private readonly listTrainerStudentPhysicals: ListTrainerStudentPhysicalsUseCase,
    private readonly listTrainerStudentEvolutions: ListTrainerStudentEvolutionsUseCase,
    private readonly listTrainerStudentsAnamneses: ListTrainerStudentsAnamnesesUseCase,
    private readonly getTrainerStudentAnamnesis: GetTrainerStudentAnamnesisUseCase,
    private readonly listTrainerStudentAnamnesisHistory: ListTrainerStudentAnamnesisHistoryUseCase,
    private readonly getTrainerStudentWeeklyTraining: GetTrainerStudentWeeklyTrainingUseCase,
    private readonly getTrainerStudentMonthlyTrainingCalendar: GetTrainerStudentMonthlyTrainingCalendarUseCase,
    private readonly copyStudentTrainingPhasesUseCase: CopyStudentTrainingPhasesUseCase,
    private readonly getTrainerDisplayName: (trainerId: string) => Promise<string>
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = req.authUser!.sub;
      const result = await this.listTrainerStudents.execute(
        trainerId,
        firstQuery(req.query.page),
        firstQuery(req.query.pageSize),
        firstQuery(req.query.validation),
        firstQuery(req.query.plan)
      );
      res.status(200).json(result);
    } catch {
      res.status(500).json({ message: 'Erro ao listar alunas.' });
    }
  }

  async validationSummary(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = req.authUser!.sub;
      const result = await this.getTrainerStudentsValidationSummary.execute(trainerId);
      res.status(200).json(result);
    } catch {
      res.status(500).json({ message: 'Erro ao obter resumo de validação das alunas.' });
    }
  }

  async search(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = req.authUser!.sub;
      const result = await this.searchTrainerStudents.execute(
        trainerId,
        firstQuery(req.query.field),
        firstQuery(req.query.q),
        firstQuery(req.query.validation),
        firstQuery(req.query.plan),
        firstQuery(req.query.page),
        firstQuery(req.query.pageSize)
      );
      res.status(200).json(result);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === VALIDATION) {
        res.status(400).json({ message: error.message ?? 'Parâmetros inválidos.' });
        return;
      }
      console.error('[trainer.students.search] erro:', err);
      res.status(500).json({ message: 'Erro ao pesquisar alunas.' });
    }
  }

  async getOne(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = req.authUser!.sub;
      const studentId = firstParam(req.params.studentId);
      const result = await this.getTrainerStudent.execute(trainerId, studentId);
      res.status(200).json(result);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Aluna não encontrada.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao obter aluna.' });
    }
  }

  async patch(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = req.authUser!.sub;
      const studentId = firstParam(req.params.studentId);
      const result = await this.updateTrainerStudent.execute(trainerId, studentId, req.body);
      res.status(200).json(result);
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        res.status(409).json({ message: 'Conflito ao salvar os dados da aluna.' });
        return;
      }
      const error = err as { name?: string; message?: string };
      if (error.name === VALIDATION) {
        res.status(400).json({ message: error.message ?? 'Dados inválidos.' });
        return;
      }
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Aluna não encontrada.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao atualizar aluna.' });
    }
  }

  async listAnamneses(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = req.authUser!.sub;
      const items = await this.listTrainerStudentsAnamneses.execute(trainerId);
      res.status(200).json({ items });
    } catch {
      res.status(500).json({ message: 'Erro ao listar anamneses das alunas.' });
    }
  }

  async getStudentAnamnesis(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = req.authUser!.sub;
      const studentId = firstParam(req.params.studentId);
      const row = await this.getTrainerStudentAnamnesis.execute(trainerId, studentId);
      res.status(200).json(row);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Aluna não encontrada.' });
        return;
      }
      if (error.name === ANAMNESIS_NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Anamnese não encontrada.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao obter anamnese da aluna.' });
    }
  }

  async deleteAnamnesis(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = req.authUser!.sub;
      const studentId = firstParam(req.params.studentId);
      await this.deleteTrainerStudentAnamnesis.execute(trainerId, studentId);
      res.status(204).end();
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Aluna não encontrada.' });
        return;
      }
      if (error.name === ANAMNESIS_NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Anamnese não encontrada.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao excluir anamnese.' });
    }
  }

  async listStudentPhysicals(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = req.authUser!.sub;
      const studentId = firstParam(req.params.studentId);
      const items = await this.listTrainerStudentPhysicals.execute(trainerId, studentId);
      res.status(200).json({ items });
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Aluna não encontrada.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao listar registros físicos da aluna.' });
    }
  }

  async listStudentEvolutions(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = req.authUser!.sub;
      const studentId = firstParam(req.params.studentId);
      const items = await this.listTrainerStudentEvolutions.execute(trainerId, studentId);
      res.status(200).json({ items });
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Aluna não encontrada.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao listar evoluções da aluna.' });
    }
  }

  async listStudentAnamnesisHistory(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = req.authUser!.sub;
      const studentId = firstParam(req.params.studentId);
      const result = await this.listTrainerStudentAnamnesisHistory.execute(
        trainerId,
        studentId,
        firstQuery(req.query.page),
        firstQuery(req.query.pageSize)
      );
      res.status(200).json(result);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Aluna não encontrada.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao listar histórico de anamnese da aluna.' });
    }
  }

  async getStudentWeeklyTraining(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = req.authUser!.sub;
      const studentId = firstParam(req.params.studentId);
      const result = await this.getTrainerStudentWeeklyTraining.execute(trainerId, studentId);
      res.status(200).json(result);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Aluna não encontrada.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao obter treinos da semana da aluna.' });
    }
  }

  async getStudentTrainingCalendar(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = req.authUser!.sub;
      const studentId = firstParam(req.params.studentId);
      const result = await this.getTrainerStudentMonthlyTrainingCalendar.execute(
        trainerId,
        studentId,
        req.query.month,
        req.query.year
      );
      res.status(200).json(result);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Aluna não encontrada.' });
        return;
      }
      if (error.name === 'ValidationException') {
        res.status(400).json({ message: error.message ?? 'Parâmetros inválidos.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao obter calendário de treinos da aluna.' });
    }
  }

  async copyStudentTrainingPhases(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = req.authUser!.sub;
      const studentId = firstParam(req.params.studentId);
      const trainerName = await this.getTrainerDisplayName(trainerId);
      const result = await this.copyStudentTrainingPhasesUseCase.execute(
        studentId,
        req.body,
        trainerId,
        trainerName
      );
      res.status(200).json(result);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === FORBIDDEN) {
        res.status(403).json({ message: error.message ?? 'Acesso negado.' });
        return;
      }
      if (error.name === VALIDATION) {
        res.status(400).json({ message: error.message ?? 'Parâmetros inválidos.' });
        return;
      }
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Aluna não encontrada.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao copiar rotinas de treino.' });
    }
  }
}
