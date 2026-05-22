import type { IncomingMessage, Server } from 'http';
import { URL } from 'url';
import WebSocket, { WebSocketServer } from 'ws';
import type { AppendConversationTurnUseCase } from '../../application/use-cases/conversations/append-conversation-turn.use-case';
import type { ConversationRealtimeHub } from './conversation-realtime.hub';

const CLOSE_AUTH = 4401;

type RawData = Buffer | ArrayBuffer | Buffer[];

type ClientInbound =
  | { type: 'join'; studentId?: unknown }
  | { type: 'message'; text?: unknown };

function rawToUtf8(raw: RawData): string {
  if (typeof raw === 'string') return raw;
  if (Buffer.isBuffer(raw)) return raw.toString('utf8');
  if (raw instanceof ArrayBuffer) return Buffer.from(raw).toString('utf8');
  return Buffer.concat(raw).toString('utf8');
}

function parseInbound(raw: RawData): ClientInbound | null {
  try {
    const obj = JSON.parse(rawToUtf8(raw)) as ClientInbound & { type?: unknown };
    if (!obj || typeof obj !== 'object' || typeof obj.type !== 'string') return null;
    return obj as ClientInbound;
  } catch {
    return null;
  }
}

function send(ws: WebSocket, obj: object): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(obj));
  }
}

export type ConversationParticipant = { role: 'trainer' | 'student'; sub: string };

export type AttachConversationWsDeps = {
  httpServer: Server;
  wsPathname: string;
  verifyAccessToken: (token: string) => Promise<{ sub: string }>;
  resolveParticipant: (cognitoSub: string) => Promise<ConversationParticipant | null>;
  authorizeRoom: (viewer: ConversationParticipant, roomStudentId: string) => Promise<void>;
  appendTurn: AppendConversationTurnUseCase;
  hub: ConversationRealtimeHub;
};

/**
 * URL: `{wsPathname}?token=<access JWT Cognito>`.
 * Ver descrição no Swagger (tag Conversas — WebSocket).
 */
export function attachConversationWebSocket(opts: AttachConversationWsDeps): WebSocketServer {
  const {
    httpServer,
    wsPathname,
    verifyAccessToken,
    resolveParticipant,
    authorizeRoom,
    appendTurn,
    hub,
  } = opts;

  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (req: IncomingMessage, socket, head) => {
    const host = req.headers.host ?? '127.0.0.1';
    let pathname = '';
    let token: string | null = null;
    try {
      const u = new URL(req.url ?? '', `http://${host}`);
      pathname = u.pathname;
      token = u.searchParams.get('token');
    } catch {
      socket.destroy();
      return;
    }

    if (pathname !== wsPathname || !token?.trim()) {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws: WebSocket) => {
      void handleNewSocket(ws, token!.trim());
    });
  });

  async function handleNewSocket(ws: WebSocket, accessToken: string): Promise<void> {
    let sub: string;
    try {
      ({ sub } = await verifyAccessToken(accessToken));
    } catch {
      ws.close(CLOSE_AUTH, 'invalid_token');
      return;
    }

    const participant = await resolveParticipant(sub);
    if (!participant) {
      ws.close(CLOSE_AUTH, 'unknown_user');
      return;
    }

    const authCtx: ConversationParticipant = participant;

    send(ws, { type: 'connected', payload: { role: authCtx.role } });

    let joinedRoomStudentId: string | null = null;

    async function subscribeRoom(studentIdForRoom: string): Promise<boolean> {
      try {
        await authorizeRoom(authCtx, studentIdForRoom);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Proibido.';
        send(ws, { type: 'error', code: 'FORBIDDEN', message: msg });
        return false;
      }
      hub.subscribeRoom(studentIdForRoom, ws);
      joinedRoomStudentId = studentIdForRoom;
      send(ws, { type: 'joined', payload: { studentId: joinedRoomStudentId } });
      return true;
    }

    if (authCtx.role === 'student') {
      const ok = await subscribeRoom(authCtx.sub);
      if (!ok) ws.close(CLOSE_AUTH, 'join_failed');
    }

    ws.on('message', async (raw) => {
      const msg = parseInbound(raw as RawData);
      if (!msg) {
        send(ws, { type: 'error', code: 'INVALID_JSON', message: 'JSON inválido.' });
        return;
      }

      if (msg.type === 'join') {
        if (authCtx.role !== 'trainer') {
          send(ws, { type: 'error', code: 'INVALID', message: 'Alunas não precisam de join.' });
          return;
        }
        const sidRaw = typeof msg.studentId === 'string' ? msg.studentId.trim() : '';
        if (!sidRaw) {
          send(ws, { type: 'error', code: 'VALIDATION', message: 'Informe studentId no join.' });
          return;
        }
        if (joinedRoomStudentId !== null) {
          if (joinedRoomStudentId !== sidRaw) {
            send(ws, {
              type: 'error',
              code: 'ALREADY_JOINED',
              message: 'Já está numa sala; encerre ou use outra conexão para outra conversa.',
            });
            return;
          }
          send(ws, { type: 'joined', payload: { studentId: joinedRoomStudentId } });
          return;
        }
        await subscribeRoom(sidRaw);
        return;
      }

      if (msg.type === 'message') {
        if (joinedRoomStudentId === null) {
          send(ws, { type: 'error', code: 'NOT_JOINED', message: 'Entre na conversa primeiro (join).' });
          return;
        }

        try {
          await appendTurn.execute(authCtx, {
            studentConversationId: joinedRoomStudentId,
            text: msg.text,
          });
        } catch (err) {
          const e = err as { name?: string; message?: string };
          send(ws, {
            type: 'error',
            code: e.name ?? 'ERROR',
            message: e.message ?? 'Erro ao gravar mensagem.',
          });
        }
        return;
      }

      send(ws, { type: 'error', code: 'UNKNOWN_TYPE', message: 'Tipo não suportado.' });
    });
  }

  return wss;
}
