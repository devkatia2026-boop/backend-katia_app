import type { Request, Response } from 'express';
import { UniqueConstraintError } from 'sequelize';
import type { ListTrainerStudentsUseCase } from '../../../application/use-cases/trainer/list-trainer-students.use-case';
import type { SearchTrainerStudentsUseCase } from '../../../application/use-cases/trainer/search-trainer-students.use-case';
import type { GetTrainerStudentUseCase } from '../../../application/use-cases/trainer/get-trainer-student.use-case';
import type { UpdateTrainerStudentUseCase } from '../../../application/use-cases/trainer/update-trainer-student.use-case';
import type { DeleteTrainerStudentAnamnesisUseCase } from '../../../application/use-cases/trainer/delete-trainer-student-anamnesis.use-case';
import type { ListTrainerStudentPhysicalsUseCase } from '../../../application/use-cases/trainer/list-trainer-student-physicals.use-case';
import type { ListTrainerStudentEvolutionsUseCase } from '../../../application/use-cases/trainer/list-trainer-student-evolutions.use-case';

const VALIDATION = 'ValidationException';
const NOT_FOUND = 'StudentNotFoundException';
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
    private readonly getTrainerStudent: GetTrainerStudentUseCase,
    private readonly updateTrainerStudent: UpdateTrainerStudentUseCase,
    private readonly deleteTrainerStudentAnamnesis: DeleteTrainerStudentAnamnesisUseCase,
    private readonly listTrainerStudentPhysicals: ListTrainerStudentPhysicalsUseCase,
    private readonly listTrainerStudentEvolutions: ListTrainerStudentEvolutionsUseCase
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = req.authUser!.sub;
      const result = await this.listTrainerStudents.execute(
        trainerId,
        firstQuery(req.query.page),
        firstQuery(req.query.pageSize)
      );
      res.status(200).json(result);
    } catch {
      res.status(500).json({ message: 'Erro ao listar alunas.' });
    }
  }

  async search(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = req.authUser!.sub;
      const result = await this.searchTrainerStudents.execute(
        trainerId,
        firstQuery(req.query.field),
        firstQuery(req.query.q),
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
}
