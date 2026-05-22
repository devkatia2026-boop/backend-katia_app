import type { PagedList } from './social-feed.port';

export type ConversationSenderRole = 'trainer' | 'student';

/** Uma entrada da tabela: uma mensagem só (coluna não usada como null). */
export type ConversationMessageDTO = {
  id: number;
  student_id: string;
  sender_role: ConversationSenderRole;
  body: string;
  created_at: Date;
};

export interface IConversationsRepository {
  appendMessage(input: {
    student_id: string;
    sender_role: ConversationSenderRole;
    body: string;
  }): Promise<ConversationMessageDTO>;
  listByStudent(
    studentId: string,
    page: number,
    pageSize: number
  ): Promise<PagedList<ConversationMessageDTO>>;
  getTrainerIdForStudent(studentId: string): Promise<string | null>;
}

export interface IConversationBroadcastPublisher {
  /** Room = student_id da conversa (par fixo treinadora–aluna). */
  publishNewMessage(roomStudentId: string, message: ConversationMessageDTO): void;
}
