import type { Request, Response } from 'express';
import type { ListPlaylistsUseCase } from '../../../application/use-cases/playlists/list-playlists.use-case';
import type { GetPlaylistUseCase } from '../../../application/use-cases/playlists/get-playlist.use-case';
import type { CreatePlaylistUseCase } from '../../../application/use-cases/playlists/create-playlist.use-case';
import type { UpdatePlaylistUseCase } from '../../../application/use-cases/playlists/update-playlist.use-case';
import type { DeletePlaylistUseCase } from '../../../application/use-cases/playlists/delete-playlist.use-case';
import {
  OBJECT_STORAGE_EXCEPTION,
  type UploadImageFilesUseCase,
} from '../../../application/use-cases/media/upload-image-files.use-case';
import {
  PLAYLIST_IMAGE_FIELDS,
  S3_PREFIX_PLAYLIST,
} from '../../../application/media/image-upload.config';
import { parseResourceId } from '../../../application/parsing/content-body.parsing';
import type { ContentViewerRole } from '../../../application/parsing/content-viewer.parsing';
import { mergeImageUploadsIntoBody } from '../helpers/merge-image-uploads';

const VALIDATION = 'ValidationException';
const NOT_FOUND = 'NotFoundException';

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function firstQuery(value: unknown): unknown {
  if (Array.isArray(value)) return value[0];
  return value;
}

function viewerRole(req: Request): ContentViewerRole {
  return req.authUser!.role as ContentViewerRole;
}

export class PlaylistsController {
  constructor(
    private readonly listPlaylists: ListPlaylistsUseCase,
    private readonly getPlaylist: GetPlaylistUseCase,
    private readonly createPlaylist: CreatePlaylistUseCase,
    private readonly updatePlaylist: UpdatePlaylistUseCase,
    private readonly deletePlaylist: DeletePlaylistUseCase,
    private readonly uploadImages: UploadImageFilesUseCase
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listPlaylists.execute(
        firstQuery(req.query.page),
        firstQuery(req.query.pageSize),
        viewerRole(req)
      );
      res.status(200).json(result);
    } catch (err) {
      this.handleRead(err, res);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.playlistId), 'playlistId');
      const row = await this.getPlaylist.execute(id, viewerRole(req));
      res.status(200).json(row);
    } catch (err) {
      this.handleRead(err, res);
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = req.authUser!.sub;
      const body = await mergeImageUploadsIntoBody(
        req,
        this.uploadImages,
        trainerId,
        S3_PREFIX_PLAYLIST,
        PLAYLIST_IMAGE_FIELDS
      );
      const created = await this.createPlaylist.execute(body);
      res.status(201).json(created);
    } catch (err) {
      this.handleWrite(err, res);
    }
  }

  async patch(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.playlistId), 'playlistId');
      const trainerId = req.authUser!.sub;
      const body = await mergeImageUploadsIntoBody(
        req,
        this.uploadImages,
        trainerId,
        S3_PREFIX_PLAYLIST,
        PLAYLIST_IMAGE_FIELDS
      );
      const updated = await this.updatePlaylist.execute(id, body);
      res.status(200).json(updated);
    } catch (err) {
      this.handleWrite(err, res);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.playlistId), 'playlistId');
      await this.deletePlaylist.execute(id);
      res.status(204).end();
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === VALIDATION) {
        res.status(400).json({ message: error.message ?? 'Parâmetro inválido.' });
        return;
      }
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Playlist não encontrada.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao excluir playlist.' });
    }
  }

  private handleRead(err: unknown, res: Response): void {
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Parâmetro inválido.' });
      return;
    }
    if (error.name === NOT_FOUND) {
      res.status(404).json({ message: error.message ?? 'Playlist não encontrada.' });
      return;
    }
    res.status(500).json({ message: 'Erro ao consultar playlist.' });
  }

  private handleWrite(err: unknown, res: Response): void {
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Dados inválidos.' });
      return;
    }
    if (error.name === NOT_FOUND) {
      res.status(404).json({ message: error.message ?? 'Playlist não encontrada.' });
      return;
    }
    if (error.name === OBJECT_STORAGE_EXCEPTION) {
      res.status(503).json({ message: error.message ?? 'Armazenamento indisponível.' });
      return;
    }
    res.status(500).json({ message: 'Erro ao salvar playlist.' });
  }
}
