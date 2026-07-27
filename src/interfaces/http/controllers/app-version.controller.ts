import type { Request, Response } from 'express';
import type {
  CreateAppVersionUseCase,
  GetAppVersionUseCase,
  UpdateAppVersionUseCase,
} from '../../../application/use-cases/app-version/app-version.use-cases';

const VALIDATION = 'ValidationException';
const NOT_FOUND = 'NotFoundException';
const CONFLICT = 'ConflictException';

export class AppVersionController {
  constructor(
    private readonly getAppVersion: GetAppVersionUseCase,
    private readonly createAppVersion: CreateAppVersionUseCase,
    private readonly updateAppVersion: UpdateAppVersionUseCase
  ) {}

  async get(req: Request, res: Response): Promise<void> {
    try {
      const row = await this.getAppVersion.execute();
      res.status(200).json(row);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Versão não cadastrada.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao obter versão do app.' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const created = await this.createAppVersion.execute(req.body);
      res.status(201).json(created);
    } catch (err) {
      this.handleWrite(err, res);
    }
  }

  async patch(req: Request, res: Response): Promise<void> {
    try {
      const updated = await this.updateAppVersion.execute(req.body);
      res.status(200).json(updated);
    } catch (err) {
      this.handleWrite(err, res);
    }
  }

  private handleWrite(err: unknown, res: Response): void {
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Dados inválidos.' });
      return;
    }
    if (error.name === CONFLICT) {
      res.status(409).json({ message: error.message ?? 'Conflito ao cadastrar versão.' });
      return;
    }
    if (error.name === NOT_FOUND) {
      res.status(404).json({ message: error.message ?? 'Versão não cadastrada.' });
      return;
    }
    res.status(500).json({ message: 'Erro ao salvar versão do app.' });
  }
}
