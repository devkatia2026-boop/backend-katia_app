import type { Conversation } from './models/conversation.model';
import type { DatabaseModels } from './models';
import type {
  ConversationMessageDTO,
  ConversationSenderRole,
  IConversationsRepository,
} from '../../application/ports/conversations.port';
import type { PagedList } from '../../application/ports/social-feed.port';

function pickSender(row: Conversation): { sender_role: ConversationSenderRole; body: string } | null {
  const tm = row.trainer_message?.trim() ?? '';
  const sm = row.student_message?.trim() ?? '';
  if (tm.length > 0 && sm.length > 0) {
    throw new Error('Linha inconsistente em conversations (mensagem dupla).');
  }
  if (tm.length > 0) return { sender_role: 'trainer', body: tm };
  if (sm.length > 0) return { sender_role: 'student', body: sm };
  return null;
}

function rowToDto(row: Conversation): ConversationMessageDTO {
  const pick = pickSender(row);
  if (!pick) {
    throw new Error('Linha de conversa sem mensagem.');
  }
  return {
    id: row.id,
    student_id: row.student_id,
    sender_role: pick.sender_role,
    body: pick.body,
    created_at: row.created_at,
  };
}

export class SequelizeConversationsRepository implements IConversationsRepository {
  constructor(
    private readonly models: Pick<DatabaseModels, 'Conversation' | 'Student'>
  ) {}

  async appendMessage(input: {
    student_id: string;
    sender_role: ConversationSenderRole;
    body: string;
  }): Promise<ConversationMessageDTO> {
    const payload =
      input.sender_role === 'trainer'
        ? { student_id: input.student_id, trainer_message: input.body, student_message: null }
        : { student_id: input.student_id, trainer_message: null, student_message: input.body };

    const created = await this.models.Conversation.create(payload as never);
    return rowToDto(created as Conversation);
  }

  async listByStudent(
    studentId: string,
    page: number,
    pageSize: number
  ): Promise<PagedList<ConversationMessageDTO>> {
    const offset = (page - 1) * pageSize;
    const where = { student_id: studentId };
    const [total, rows] = await Promise.all([
      this.models.Conversation.count({ where }),
      this.models.Conversation.findAll({
        where,
        order: [
          ['created_at', 'DESC'],
          ['id', 'DESC'],
        ],
        limit: pageSize,
        offset,
      }),
    ]);
    const items = rows
      .map((r) => {
        try {
          return rowToDto(r as Conversation);
        } catch {
          return null;
        }
      })
      .filter((x): x is ConversationMessageDTO => x !== null);

    return { items, total, page, pageSize };
  }

  /** Usado apenas para garantir vínculo aluna–treinador (autorização). */
  async getTrainerIdForStudent(studentId: string): Promise<string | null> {
    const row = await this.models.Student.findByPk(studentId, {
      attributes: ['trainer_id'],
      raw: true,
    });
    return row ? (row as { trainer_id: string }).trainer_id : null;
  }
}
