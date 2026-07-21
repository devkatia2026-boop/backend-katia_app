import { downloadRemoteMedia } from '../../media/fetch-remote-media';
import type { IObjectStorage } from '../../ports/object-storage.port';

export type RemoteMediaPayload = {
  buffer: Buffer;
  contentType: string;
};

export class GetRemoteMediaUseCase {
  constructor(private readonly objectStorage: IObjectStorage | null = null) {}

  async execute(url: string): Promise<RemoteMediaPayload> {
    const remote = await downloadRemoteMedia(url, this.objectStorage);

    return {
      buffer: remote.buffer,
      contentType: remote.contentType ?? 'application/octet-stream',
    };
  }
}
