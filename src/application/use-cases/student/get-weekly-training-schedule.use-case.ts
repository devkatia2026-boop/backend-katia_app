import {
  getBrazilWeekDays,
  parseSetOrder,
  resolveTodayTrainingFromOrder,
} from '../../parsing/set-order-schedule.parsing';
import type { IPointsRepository } from '../../ports/points.port';
import type { ISetsToStudentsRepository, SetToStudentSetNested } from '../../ports/sets-to-students.port';
import type { ITrainingsRepository, TrainingDTO } from '../../ports/trainings.port';

const NOT_FOUND = 'NotFoundException';
const VALIDATION = 'ValidationException';

export type WeeklyTrainingDayItem = {
  date: string;
  day_of_week: number;
  trained: boolean;
  kind: 'training';
  training_id: number;
  order_index: number;
  training: TrainingDTO;
};

export type WeeklyTrainingNextItem = {
  date: string;
  day_of_week: number;
  training_id: number;
  order_index: number;
  training: TrainingDTO;
};

export type WeeklyTrainingScheduleItem = {
  set_to_student_id: number;
  student_id: string;
  sets_id: number;
  validity: string | null;
  status: boolean | null;
  created_at: Date;
  set: SetToStudentSetNested;
  week_start: string;
  week_end: string;
  week_days: WeeklyTrainingDayItem[];
  next_training: WeeklyTrainingNextItem | null;
  total_trainings: number;
  completed_trainings: number;
  pending_trainings: number;
};

export type GetWeeklyTrainingScheduleResult = {
  date: string;
  day_of_week: number;
  week_start: string;
  week_end: string;
  items: WeeklyTrainingScheduleItem[];
};

export class GetWeeklyTrainingScheduleUseCase {
  constructor(
    private readonly setsToStudents: ISetsToStudentsRepository,
    private readonly trainings: ITrainingsRepository,
    private readonly points: IPointsRepository
  ) {}

  async execute(studentId: string): Promise<GetWeeklyTrainingScheduleResult> {
    const links = await this.setsToStudents.listActiveSetsByStudent(studentId);

    if (links.length === 0) {
      const err = new Error('Nenhum set ativo vinculado.');
      err.name = NOT_FOUND;
      throw err;
    }

    const prepared = links.map((link) => {
      const orderIds = parseSetOrder(link.set?.order ?? null);
      if (orderIds.length === 0) {
        const err = new Error(`Set ${link.sets_id} não possui ordem de treinos válida.`);
        err.name = VALIDATION;
        throw err;
      }
      if (!link.set) {
        const err = new Error(`Set ${link.sets_id} não encontrado.`);
        err.name = NOT_FOUND;
        throw err;
      }
      return { link, orderIds, set: link.set };
    });

    const weekRanges = prepared.map((entry) => getBrazilWeekDays(entry.orderIds.length));
    const weekStart = weekRanges[0].week_start;
    const weekEnd = weekRanges.reduce(
      (latest, week) => (week.week_end > latest ? week.week_end : latest),
      weekRanges[0].week_end
    );
    const trainingDates = new Set(
      await this.points.listBrazilTrainingDatesForStudent(studentId, weekStart, weekEnd)
    );

    const outerWeek = weekRanges.reduce((current, week) =>
      week.days.length > current.days.length ? week : current
    );

    const trainingIds = new Set<number>();
    for (const entry of prepared) {
      const week = getBrazilWeekDays(entry.orderIds.length);
      for (const day of week.days) {
        const schedule = resolveTodayTrainingFromOrder(entry.orderIds, day.day_of_week);
        if (schedule?.kind === 'training') {
          trainingIds.add(schedule.trainingId);
        }
      }
    }

    const trainingRows =
      trainingIds.size > 0 ? await this.trainings.findByIds([...trainingIds]) : [];
    const trainingById = new Map(trainingRows.map((row) => [row.id, row]));

    const items: WeeklyTrainingScheduleItem[] = [];

    for (const { link, orderIds, set } of prepared) {
      const week = getBrazilWeekDays(orderIds.length);
      const weekDays: WeeklyTrainingDayItem[] = [];

      for (const day of week.days) {
        const schedule = resolveTodayTrainingFromOrder(orderIds, day.day_of_week);
        if (!schedule || schedule.kind !== 'training') {
          const err = new Error(`Set ${link.sets_id} não possui ordem de treinos válida.`);
          err.name = VALIDATION;
          throw err;
        }

        const training = trainingById.get(schedule.trainingId);
        if (!training) {
          const err = new Error(`Treino ${schedule.trainingId} não encontrado.`);
          err.name = NOT_FOUND;
          throw err;
        }

        weekDays.push({
          date: day.date,
          day_of_week: day.day_of_week,
          trained: trainingDates.has(day.date),
          kind: 'training',
          training_id: schedule.trainingId,
          order_index: schedule.orderIndex,
          training,
        });
      }

      const completedTrainings = weekDays.filter((day) => day.trained).length;
      const totalTrainings = weekDays.length;
      const pendingTrainings = totalTrainings - completedTrainings;

      let nextTraining: WeeklyTrainingNextItem | null = null;
      for (const day of weekDays) {
        if (day.date < week.today) continue;
        if (day.trained) continue;
        nextTraining = {
          date: day.date,
          day_of_week: day.day_of_week,
          training_id: day.training_id,
          order_index: day.order_index,
          training: day.training,
        };
        break;
      }

      items.push({
        set_to_student_id: link.id,
        student_id: link.student_id,
        sets_id: link.sets_id,
        validity: link.validity,
        status: link.status,
        created_at: link.created_at,
        set,
        week_start: week.week_start,
        week_end: week.week_end,
        week_days: weekDays,
        next_training: nextTraining,
        total_trainings: totalTrainings,
        completed_trainings: completedTrainings,
        pending_trainings: pendingTrainings,
      });
    }

    return {
      date: outerWeek.today,
      day_of_week: outerWeek.today_day_of_week,
      week_start: outerWeek.week_start,
      week_end: outerWeek.week_end,
      items,
    };
  }
}
