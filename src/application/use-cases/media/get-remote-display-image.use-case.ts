import { convertHeicBufferToJpeg } from '../../media/convert-heic-to-jpeg';
import { REMOTE_MEDIA, downloadRemoteMedia } from '../../media/fetch-remote-media';
import {
  isHeicRemoteSource,
  resolveRemoteImageContentType,
} from '../../media/remote-media.config';
import type { IObjectStorage } from '../../ports/object-storage.port';

export type RemoteDisplayImagePayload = {
  buffer: Buffer;
  contentType: string;
};

export class GetRemoteDisplayImageUseCase {
  constructor(private readonly objectStorage: IObjectStorage | null = null) {}

  async execute(url: string): Promise<RemoteDisplayImagePayload> {
    const remote = await downloadRemoteMedia(url, this.objectStorage);

    if (!isHeicRemoteSource(url, remote.contentType, remote.buffer)) {
      return {
        buffer: remote.buffer,
        contentType: resolveRemoteImageContentType(url, remote.contentType),
      };
    }

    try {
      const buffer = await convertHeicBufferToJpeg(remote.buffer);

      return {
        buffer,
        contentType: 'image/jpeg',
      };
    } catch {
      const err = new Error('Falha ao converter imagem HEIC.');
      err.name = REMOTE_MEDIA;
      throw err;
    }
  }
}
