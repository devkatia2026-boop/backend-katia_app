import type { Request, Response } from 'express';
import { UniqueConstraintError } from 'sequelize';
import type { GetMeUseCase } from '../../../application/use-cases/auth/get-me.use-case';
import type { UpdateMyProfileUseCase } from '../../../application/use-cases/auth/update-my-profile.use-case';
import {
  OBJECT_STORAGE_EXCEPTION,
  type UploadImageFilesUseCase,
} from '../../../application/use-cases/media/upload-image-files.use-case';
import {
  PROFILE_IMAGE_FIELDS,
  S3_PREFIX_PROFILE,
} from '../../../application/media/image-upload.config';
import { mergeImageUploadsIntoBody } from '../helpers/merge-image-uploads';

const PROFILE_NOT_FOUND = 'ProfileNotFoundException';
const VALIDATION = 'ValidationException';

export class MeController {
  constructor(
    private readonly getMeUseCase: GetMeUseCase,
    private readonly updateMyProfileUseCase: UpdateMyProfileUseCase,
    private readonly uploadImages: UploadImageFilesUseCase
  ) {}

  async getMe(req: Request, res: Response): Promise<void> {
    try {
      const sub = req.authUser?.sub;
      if (!sub) {
        res.status(401).json({ message: 'Usuário não autenticado.' });
        return;
      }

      const result = await this.getMeUseCase.execute(sub);
      res.status(200).json(result);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === PROFILE_NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Perfil não encontrado.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao obter dados do usuário.' });
    }
  }

  async patchMe(req: Request, res: Response): Promise<void> {
    try {
      const sub = req.authUser?.sub;
      const accessToken = req.authUser?.accessToken;
      if (!sub || !accessToken) {
        res.status(401).json({ message: 'Usuário não autenticado.' });
        return;
      }

      const body = await mergeImageUploadsIntoBody(
        req,
        this.uploadImages,
        sub,
        S3_PREFIX_PROFILE,
        PROFILE_IMAGE_FIELDS
      );
      const result = await this.updateMyProfileUseCase.execute(sub, accessToken, body);
      res.status(200).json(result);
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        res.status(409).json({ message: 'Conflito ao salvar o perfil no banco de dados.' });
        return;
      }
      const error = err as { name?: string; message?: string };
      if (error.name === OBJECT_STORAGE_EXCEPTION) {
        res.status(503).json({ message: error.message ?? 'Armazenamento indisponível.' });
        return;
      }
      if (error.name === VALIDATION) {
        res.status(400).json({ message: error.message ?? 'Dados inválidos.' });
        return;
      }
      if (error.name === PROFILE_NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Perfil não encontrado.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao atualizar o perfil.' });
    }
  }
}
