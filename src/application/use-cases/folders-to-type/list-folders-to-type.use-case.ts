import { parseOptionalPositiveIntQuery } from '../../parsing/content-body.parsing';
import { parseOptionalFolderToTypeKindQuery } from '../../parsing/folder-to-type-body.parsing';
import { normalizePagination } from '../../parsing/pagination.parsing';
import type {
  FolderToTypeDTO,
  IFoldersToTypeRepository,
} from '../../ports/folders-to-type.port';
import type { PagedList } from '../../ports/social-feed.port';

export class ListFoldersToTypeUseCase {
  constructor(private readonly repo: IFoldersToTypeRepository) {}

  execute(
    page: unknown,
    pageSize: unknown,
    rawFolderId: unknown,
    rawType: unknown,
    rawTrainingId: unknown,
    rawExerciseId: unknown,
    rawSetId: unknown
  ): Promise<PagedList<FolderToTypeDTO>> {
    const p = normalizePagination(page, pageSize);
    const folderId = parseOptionalPositiveIntQuery(rawFolderId, 'folderId');
    const type = parseOptionalFolderToTypeKindQuery(rawType);
    const trainingId = parseOptionalPositiveIntQuery(rawTrainingId, 'trainingId');
    const exerciseId = parseOptionalPositiveIntQuery(rawExerciseId, 'exerciseId');
    const setId = parseOptionalPositiveIntQuery(rawSetId, 'setId');
    return this.repo.listPaged(p.page, p.pageSize, {
      folderId,
      type,
      trainingId,
      exerciseId,
      setId,
    });
  }
}
