import type {
  ConversationPartnerDTO,
  IConversationsRepository,
} from '../../ports/conversations.port';
import { parseOptionalUuid } from '../../parsing/set-to-student-body.parsing';

const FORBIDDEN = 'ForbiddenException';
const NOT_FOUND = 'NotFoundException';
const VALIDATION = 'ValidationException';

export class GetConversationPartnerUseCase {
  constructor(private readonly repo: IConversationsRepository) {}

  async execute(
    rawStudentId: unknown,
    auth: { role: 'student' | 'trainer'; sub: string }
  ): Promise<ConversationPartnerDTO> {
    if (auth.role === 'student') {
      const hinted = parseOptionalUuid(rawStudentId, 'studentId');
      if (hinted !== undefined && hinted !== auth.sub) {
        const err = new Error('Você só pode ver a própria conversa.');
        err.name = FORBIDDEN;
        throw err;
      }

      const partner = await this.repo.getPartnerForStudent(auth.sub);
      if (!partner) {
        const err = new Error('Parceiro de conversa não encontrado.');
        err.name = NOT_FOUND;
        throw err;
      }

      return partner;
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

    const partner = await this.repo.getStudentPartner(sid);
    if (!partner) {
      const err = new Error('Aluna não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }

    return partner;
  }
}
