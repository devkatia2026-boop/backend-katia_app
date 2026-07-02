import type { IConversationMessageNotifier } from '../../ports/conversation-message-notifier.port';
import type {
  ConversationMessageDTO,
  ConversationSenderRole,
  IConversationBroadcastPublisher,
  IConversationPresenceReader,
  IConversationsRepository,
} from '../../ports/conversations.port';

const VALIDATION = 'ValidationException';
const FORBIDDEN = 'ForbiddenException';

function expectTrimmedNonEmpty(text: unknown, field: string): string {
  if (typeof text !== 'string') {
    const err = new Error(`Campo "${field}" deve ser string.`);
    err.name = VALIDATION;
    throw err;
  }
  const t = text.trim();
  if (t.length === 0) {
    const err = new Error(`Campo "${field}" não pode ser vazio.`);
    err.name = VALIDATION;
    throw err;
  }
  return t;
}

export class AppendConversationTurnUseCase {
  constructor(
    private readonly repo: IConversationsRepository,
    private readonly broadcast: IConversationBroadcastPublisher,
    private readonly notifier: IConversationMessageNotifier,
    private readonly presence: IConversationPresenceReader
  ) {}

  async execute(
    actor: { role: ConversationSenderRole; sub: string },
    payload: { studentConversationId: string; text: unknown }
  ): Promise<ConversationMessageDTO> {
    const sid = payload.studentConversationId.trim();
    const senderRole: ConversationSenderRole = actor.role;

    if (!sid) {
      const err = new Error('studentConversationId é obrigatório.');
      err.name = VALIDATION;
      throw err;
    }

    if (senderRole === 'student' && actor.sub !== sid) {
      const err = new Error('Só pode escrever na própria conversa.');
      err.name = FORBIDDEN;
      throw err;
    }

    if (senderRole === 'trainer') {
      const tid = await this.repo.getTrainerIdForStudent(sid);
      if (tid !== actor.sub) {
        const err = new Error('Esta conversa não é com uma aluna sua.');
        err.name = FORBIDDEN;
        throw err;
      }
    }

    const bodyText = expectTrimmedNonEmpty(payload.text, 'text');

    const created = await this.repo.appendMessage({
      student_id: sid,
      sender_role: senderRole,
      body: bodyText,
    });

    this.broadcast.publishNewMessage(sid, created);

    const trainerId = await this.repo.getTrainerIdForStudent(sid);
    if (trainerId) {
      const recipientRole: ConversationSenderRole =
        senderRole === 'trainer' ? 'student' : 'trainer';

      if (!this.presence.isOnline(sid, recipientRole)) {
        void this.notifier.notifyNewMessage({
          senderRole,
          recipientRole,
          studentId: sid,
          trainerId,
          body: bodyText,
          messageId: created.id,
        });
      }
    }

    return created;
  }
}
