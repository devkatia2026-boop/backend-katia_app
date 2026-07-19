import type { Request, Response } from 'express';

import type { GetRemoteDisplayImageUseCase } from '../../../application/use-cases/media/get-remote-display-image.use-case';
import type { GetRemoteMediaUseCase } from '../../../application/use-cases/media/get-remote-media.use-case';
import { REMOTE_MEDIA } from '../../../application/media/fetch-remote-media';

const VALIDATION = 'ValidationException';

function readRemoteUrl(req: Request): string | null {
  const rawUrl = req.query.url;

  if (typeof rawUrl !== 'string') {
    return null;
  }

  const url = rawUrl.trim();
  return url.length > 0 ? url : null;
}

function sendRemoteMedia(res: Response, payload: { buffer: Buffer; contentType: string }): void {
  res.setHeader('Content-Type', payload.contentType);
  res.setHeader('Cache-Control', 'private, max-age=86400');
  res.send(payload.buffer);
}

export class MediaController {
  constructor(
    private readonly getRemoteMedia: GetRemoteMediaUseCase,
    private readonly getRemoteDisplayImage: GetRemoteDisplayImageUseCase,
  ) {}

  async remote(req: Request, res: Response): Promise<void> {
    const url = readRemoteUrl(req);

    if (!url) {
      res.status(400).json({ message: 'Parâmetro url é obrigatório.' });
      return;
    }

    try {
      const payload = await this.getRemoteMedia.execute(url);
      sendRemoteMedia(res, payload);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async remoteDisplay(req: Request, res: Response): Promise<void> {
    const url = readRemoteUrl(req);

    if (!url) {
      res.status(400).json({ message: 'Parâmetro url é obrigatório.' });
      return;
    }

    try {
      const payload = await this.getRemoteDisplayImage.execute(url);
      sendRemoteMedia(res, payload);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private handleError(res: Response, error: unknown): void {
    if (error instanceof Error) {
      if (error.name === VALIDATION) {
        res.status(400).json({ message: error.message });
        return;
      }

      if (error.name === REMOTE_MEDIA) {
        res.status(502).json({ message: error.message });
        return;
      }
    }

    res.status(502).json({ message: 'Falha ao carregar mídia remota.' });
  }
}
