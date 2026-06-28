import {
  getBrazilDateContext,
  parseSetOrder,
  resolveTodayTrainingFromOrder,
} from '../../parsing/set-order-schedule.parsing';
import type { ISetsToStudentsRepository, SetToStudentSetNested } from '../../ports/sets-to-students.port';
import type { ITrainingsRepository, TrainingDTO } from '../../ports/trainings.port';

const NOT_FOUND = 'NotFoundException';
const VALIDATION = 'ValidationException';

export type TodayTrainingFreeChoiceItem = {
  kind: 'free_choice';
  message: string;
  set_to_student_id: number;
  student_id: string;
  sets_id: number;
  validity: string | null;
  status: boolean | null;
  created_at: Date;
  set: SetToStudentSetNested;
};

export type TodayTrainingScheduledItem = {
  kind: 'training';
  training_id: number;
  order_index: number;
  set_to_student_id: number;
  student_id: string;
  sets_id: number;
  validity: string | null;
  status: boolean | null;
  created_at: Date;
  set: SetToStudentSetNested;
  training: TrainingDTO;
};

export type TodayTrainingItem = TodayTrainingFreeChoiceItem | TodayTrainingScheduledItem;

export type GetTodayTrainingResult = {
  date: string;
  day_of_week: number;
  items: TodayTrainingItem[];
};

export class GetTodayTrainingUseCase {
  constructor(
    private readonly setsToStudents: ISetsToStudentsRepository,
    private readonly trainings: ITrainingsRepository
  ) {}

  async execute(studentId: string): Promise<GetTodayTrainingResult> {
    const { date, dayOfWeek } = getBrazilDateContext();
    const links = await this.setsToStudents.listActiveSetsByStudent(studentId);

    if (links.length === 0) {
      const err = new Error('Nenhum set ativo vinculado.');
      err.name = NOT_FOUND;
      throw err;
    }

    const trainingIds = new Set<number>();
    const resolved: Array<{
      link: (typeof links)[number];
      orderIds: number[];
      schedule: NonNullable<ReturnType<typeof resolveTodayTrainingFromOrder>>;
    }> = [];

    for (const link of links) {
      const orderIds = parseSetOrder(link.set?.order ?? null);
      if (orderIds.length === 0) {
        const err = new Error(`Set ${link.sets_id} não possui ordem de treinos válida.`);
        err.name = VALIDATION;
        throw err;
      }

      const schedule = resolveTodayTrainingFromOrder(orderIds, dayOfWeek);
      if (!schedule) {
        const err = new Error(`Set ${link.sets_id} não possui ordem de treinos válida.`);
        err.name = VALIDATION;
        throw err;
      }

      if (schedule.kind === 'training') {
        trainingIds.add(schedule.trainingId);
      }

      resolved.push({ link, orderIds, schedule });
    }

    const trainingRows =
      trainingIds.size > 0 ? await this.trainings.findByIds([...trainingIds]) : [];
    const trainingById = new Map(trainingRows.map((row) => [row.id, row]));

    const items: TodayTrainingItem[] = [];

    for (const { link, schedule } of resolved) {
      const set = link.set;
      if (!set) {
        const err = new Error(`Set ${link.sets_id} não encontrado.`);
        err.name = NOT_FOUND;
        throw err;
      }

      const base = {
        set_to_student_id: link.id,
        student_id: link.student_id,
        sets_id: link.sets_id,
        validity: link.validity,
        status: link.status,
        created_at: link.created_at,
        set,
      };

      if (schedule.kind === 'free_choice') {
        items.push({
          kind: 'free_choice',
          message: schedule.message,
          ...base,
        });
        continue;
      }

      const training = trainingById.get(schedule.trainingId);
      if (!training) {
        const err = new Error(`Treino ${schedule.trainingId} não encontrado.`);
        err.name = NOT_FOUND;
        throw err;
      }

      items.push({
        kind: 'training',
        training_id: schedule.trainingId,
        order_index: schedule.orderIndex,
        training,
        ...base,
      });
    }

    return { date, day_of_week: dayOfWeek, items };
  }
}
