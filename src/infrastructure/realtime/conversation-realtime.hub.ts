import WebSocket from 'ws';
import type { ConversationMessageDTO, IConversationBroadcastPublisher } from '../../application/ports/conversations.port';

/**
 * Rooms por `student_id` da conversa (par treinadora–aluna).
 */
export class ConversationRealtimeHub implements IConversationBroadcastPublisher {
  private readonly rooms = new Map<string, Set<WebSocket>>();

  subscribeRoom(roomStudentId: string, ws: WebSocket): void {
    let set = this.rooms.get(roomStudentId);
    if (!set) {
      set = new Set();
      this.rooms.set(roomStudentId, set);
    }
    set.add(ws);
    const done = (): void => {
      set!.delete(ws);
      if (set!.size === 0) this.rooms.delete(roomStudentId);
    };
    ws.once('close', done);
    ws.once('error', done);
  }

  publishNewMessage(roomStudentId: string, message: ConversationMessageDTO): void {
    const set = this.rooms.get(roomStudentId);
    if (!set?.size) return;
    const out = JSON.stringify({
      type: 'conversation:message',
      payload: {
        ...message,
        created_at: message.created_at.toISOString(),
      },
    });
    for (const client of set) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(out);
      }
    }
  }
}
