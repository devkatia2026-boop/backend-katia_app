import { downloadRemoteMedia } from '../../media/fetch-remote-media';

export type RemoteMediaPayload = {
  buffer: Buffer;
  contentType: string;
};

export class GetRemoteMediaUseCase {
  async execute(url: string): Promise<RemoteMediaPayload> {
    const remote = await downloadRemoteMedia(url);

    return {
      buffer: remote.buffer,
      contentType: remote.contentType ?? 'application/octet-stream',
    };
  }
}
