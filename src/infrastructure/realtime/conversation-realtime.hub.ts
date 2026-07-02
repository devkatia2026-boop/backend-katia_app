import WebSocket from 'ws';

import type {
  ConversationMessageDTO,
  ConversationSenderRole,
  IConversationBroadcastPublisher,
  IConversationPresenceReader,
} from '../../application/ports/conversations.port';

type RoomMember = {
  ws: WebSocket;
  role: ConversationSenderRole;
};

export class ConversationRealtimeHub
  implements IConversationBroadcastPublisher, IConversationPresenceReader
{
  private readonly rooms = new Map<string, Set<RoomMember>>();

  subscribeRoom(roomStudentId: string, ws: WebSocket, role: ConversationSenderRole): void {
    let set = this.rooms.get(roomStudentId);
    if (!set) {
      set = new Set();
      this.rooms.set(roomStudentId, set);
    }

    const member: RoomMember = { ws, role };
    set.add(member);

    const done = (): void => {
      set!.delete(member);
      if (set!.size === 0) {
        this.rooms.delete(roomStudentId);
      }
      this.publishPresence(roomStudentId);
    };

    ws.once('close', done);
    ws.once('error', done);
    this.publishPresence(roomStudentId);
  }

  isOnline(roomStudentId: string, role: ConversationSenderRole): boolean {
    const set = this.rooms.get(roomStudentId);
    if (!set) {
      return false;
    }

    for (const member of set) {
      if (member.role === role && member.ws.readyState === WebSocket.OPEN) {
        return true;
      }
    }

    return false;
  }

  publishPresence(roomStudentId: string): void {
    this.broadcastToRoom(roomStudentId, {
      type: 'conversation:presence',
      payload: {
        trainerOnline: this.isOnline(roomStudentId, 'trainer'),
        studentOnline: this.isOnline(roomStudentId, 'student'),
      },
    });
  }

  publishTyping(
    roomStudentId: string,
    senderRole: ConversationSenderRole,
    active: boolean,
    senderWs: unknown
  ): void {
    this.broadcastToRoom(
      roomStudentId,
      {
        type: 'conversation:typing',
        payload: { sender_role: senderRole, active },
      },
      senderWs as WebSocket
    );
  }

  publishNewMessage(roomStudentId: string, message: ConversationMessageDTO): void {
    this.broadcastToRoom(roomStudentId, {
      type: 'conversation:message',
      payload: {
        ...message,
        created_at: message.created_at.toISOString(),
      },
    });
  }

  private broadcastToRoom(roomStudentId: string, obj: object, except?: WebSocket): void {
    const set = this.rooms.get(roomStudentId);
    if (!set?.size) {
      return;
    }

    const out = JSON.stringify(obj);

    for (const member of set) {
      if (member.ws !== except && member.ws.readyState === WebSocket.OPEN) {
        member.ws.send(out);
      }
    }
  }
}
