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

export type ConversationPartnerDTO = {
  id: string;
  full_name: string;
  photo_perfil: string | null;
  role: ConversationSenderRole;
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
  getPartnerForStudent(studentId: string): Promise<ConversationPartnerDTO | null>;
  getStudentPartner(studentId: string): Promise<ConversationPartnerDTO | null>;
}

export interface IConversationBroadcastPublisher {
  publishNewMessage(roomStudentId: string, message: ConversationMessageDTO): void;
  publishPresence(roomStudentId: string): void;
  publishTyping(
    roomStudentId: string,
    senderRole: ConversationSenderRole,
    active: boolean,
    senderWs: unknown
  ): void;
}

export interface IConversationPresenceReader {
  isOnline(roomStudentId: string, role: ConversationSenderRole): boolean;
}
