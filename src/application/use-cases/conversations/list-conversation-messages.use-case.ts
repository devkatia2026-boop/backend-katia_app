import type { ConversationMessageDTO, IConversationsRepository } from '../../ports/conversations.port';
import type { PagedList } from '../../ports/social-feed.port';
import { normalizePagination } from '../../parsing/pagination.parsing';
import { parseOptionalUuid } from '../../parsing/set-to-student-body.parsing';

const FORBIDDEN = 'ForbiddenException';
const VALIDATION = 'ValidationException';

export class ListConversationMessagesUseCase {
  constructor(private readonly repo: IConversationsRepository) {}

  async execute(
    page: unknown,
    pageSize: unknown,
    rawStudentId: unknown,
    auth: { role: 'student' | 'trainer'; sub: string }
  ): Promise<PagedList<ConversationMessageDTO>> {
    const p = normalizePagination(page, pageSize);

    if (auth.role === 'student') {
      const hinted = parseOptionalUuid(rawStudentId, 'studentId');
      if (hinted !== undefined && hinted !== auth.sub) {
        const err = new Error('Você só pode ver a própria conversa.');
        err.name = FORBIDDEN;
        throw err;
      }
      return this.repo.listByStudent(auth.sub, p.page, p.pageSize);
    }

    const sid = parseOptionalUuid(rawStudentId, 'studentId');
    if (sid === undefined) {
      const err = new Error('Parâmetro "studentId" é obrigatório para treinadora.');
      err.name = VALIDATION;
      throw err;
    }

    const tid = await this.repo.getTrainerIdForStudent(sid);
    if (tid !== auth.sub) {
      const err = new Error('Esta conversa não é com uma aluna sua.');
      err.name = FORBIDDEN;
      throw err;
    }

    return this.repo.listByStudent(sid, p.page, p.pageSize);
  }
}
