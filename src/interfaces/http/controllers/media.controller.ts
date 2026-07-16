import type { Request, Response } from 'express';

const ALLOWED_HOST_SUFFIXES = ['.amazonaws.com'] as const;

function isAllowedRemoteMediaUrl(value: string): boolean {
  try {
    const parsed = new URL(value);

    if (parsed.protocol !== 'https:') {
      return false;
    }

    return ALLOWED_HOST_SUFFIXES.some((suffix) => parsed.hostname.endsWith(suffix));
  } catch {
    return false;
  }
}

export class MediaController {
  async remote(req: Request, res: Response): Promise<void> {
    const rawUrl = req.query.url;

    if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
      res.status(400).json({ message: 'Parâmetro url é obrigatório.' });
      return;
    }

    const url = rawUrl.trim();

    if (!isAllowedRemoteMediaUrl(url)) {
      res.status(400).json({ message: 'URL de mídia não permitida.' });
      return;
    }

    try {
      const upstream = await fetch(url);

      if (!upstream.ok) {
        res.status(502).json({ message: 'Falha ao carregar mídia remota.' });
        return;
      }

      const buffer = Buffer.from(await upstream.arrayBuffer());
      const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'private, max-age=86400');
      res.send(buffer);
    } catch {
      res.status(502).json({ message: 'Falha ao carregar mídia remota.' });
    }
  }
}
