import type { ConversationSenderRole } from './conversations.port';

export type ConversationMessageNotifyInput = {
  senderRole: ConversationSenderRole;
  recipientRole: ConversationSenderRole;
  studentId: string;
  trainerId: string;
  body: string;
  messageId: number;
};

export interface IConversationMessageNotifier {
  notifyNewMessage(input: ConversationMessageNotifyInput): Promise<void>;
}
