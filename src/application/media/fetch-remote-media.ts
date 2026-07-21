import type { IObjectStorage } from '../ports/object-storage.port';
import { assertAllowedRemoteMediaUrl } from './remote-media.config';

const REMOTE_MEDIA = 'RemoteMediaException';

export type DownloadedRemoteMedia = {
  buffer: Buffer;
  contentType: string | null;
};

export async function downloadRemoteMedia(
  url: string,
  objectStorage?: IObjectStorage | null,
): Promise<DownloadedRemoteMedia> {
  assertAllowedRemoteMediaUrl(url);

  if (objectStorage) {
    const owned = await objectStorage.getObjectByPublicUrl(url);

    if (owned) {
      return owned;
    }
  }

  let upstream: Response;

  try {
    upstream = await fetch(url);
  } catch {
    const err = new Error('Falha ao carregar mídia remota.');
    err.name = REMOTE_MEDIA;
    throw err;
  }

  if (!upstream.ok) {
    const err = new Error('Falha ao carregar mídia remota.');
    err.name = REMOTE_MEDIA;
    throw err;
  }

  const buffer = Buffer.from(await upstream.arrayBuffer());

  if (buffer.length === 0) {
    const err = new Error('Arquivo remoto vazio.');
    err.name = REMOTE_MEDIA;
    throw err;
  }

  return {
    buffer,
    contentType: upstream.headers.get('content-type'),
  };
}

export { REMOTE_MEDIA };
