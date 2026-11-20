import { parseConversationBroadcastBody } from '../../parsing/conversation-broadcast.parsing';
import type { ITrainerStudentsRepository } from '../../ports/trainer-students.port';
import type { AppendConversationTurnUseCase } from './append-conversation-turn.use-case';

const VALIDATION = 'ValidationException';
const FORBIDDEN = 'ForbiddenException';

export type ConversationBroadcastResult = {
  sent_count: number;
};

export class BroadcastConversationMessagesUseCase {
  constructor(
    private readonly students: ITrainerStudentsRepository,
    private readonly appendTurn: AppendConversationTurnUseCase
  ) {}

  async execute(
    body: unknown,
    auth: { role: 'student' | 'trainer'; sub: string }
  ): Promise<ConversationBroadcastResult> {
    if (auth.role !== 'trainer') {
      const err = new Error('Apenas treinadoras podem enviar mensagens em lote.');
      err.name = FORBIDDEN;
      throw err;
    }

    const input = parseConversationBroadcastBody(body);
    let targetStudentIds: string[] = [];

    if (input.audience === 'all') {
      targetStudentIds = await this.students.listIdsByTrainer(auth.sub);
    } else if (input.audience === 'active') {
      targetStudentIds = await this.students.listIdsByTrainer(auth.sub, 'sim');
    } else {
      const verified: string[] = [];
      for (const studentId of input.student_ids) {
        const student = await this.students.findOneForTrainer(auth.sub, studentId);
        if (!student) {
          const err = new Error('Uma ou mais alunas selecionadas não pertencem à sua conta.');
          err.name = FORBIDDEN;
          throw err;
        }
        verified.push(studentId);
      }
      targetStudentIds = verified;
    }

    if (targetStudentIds.length === 0) {
      const err = new Error('Nenhuma aluna encontrada para este envio.');
      err.name = VALIDATION;
      throw err;
    }

    for (const studentId of targetStudentIds) {
      await this.appendTurn.execute(
        { role: 'trainer', sub: auth.sub },
        { studentConversationId: studentId, text: input.text }
      );
    }

    return { sent_count: targetStudentIds.length };
  }
}