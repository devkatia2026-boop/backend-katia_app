import type { IExercisesToTrainingsRepository } from '../../ports/exercises-to-trainings.port';
import type { IRepsToExercisesRepository } from '../../ports/reps-to-exercises.port';
import type { ISetAssignedNotifier } from '../../ports/set-assigned-notifier.port';
import type { ISetsToStudentsRepository } from '../../ports/sets-to-students.port';
import { parseCopyStudentTrainingPhasesBody } from '../../parsing/copy-student-training-phases.parsing';

const FORBIDDEN = 'ForbiddenException';
const VALIDATION = 'ValidationException';
const LINK_PAGE_SIZE = 100;
const EXERCISE_PAGE_SIZE = 100;

export type CopyStudentTrainingPhasesResult = {
  copied: number;
  skipped: number;
  repsCopied: number;
  total: number;
};

function parseSetTrainingOrder(raw: string | null | undefined): number[] {
  if (!raw?.trim()) {
    return [];
  }

  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => Number.parseInt(part, 10))
    .filter((value) => Number.isFinite(value) && value >= 1);
}

export class CopyStudentTrainingPhasesUseCase {
  constructor(
    private readonly setsToStudentsRepo: ISetsToStudentsRepository,
    private readonly exercisesToTrainingsRepo: IExercisesToTrainingsRepository,
    private readonly repsToExercisesRepo: IRepsToExercisesRepository,
    private readonly setAssignedNotifier: ISetAssignedNotifier
  ) {}

  async execute(
    targetStudentId: string,
    body: unknown,
    trainerSub: string,
    trainerName: string
  ): Promise<CopyStudentTrainingPhasesResult> {
    const input = parseCopyStudentTrainingPhasesBody(body);

    if (input.sourceStudentId === targetStudentId) {
      const err = new Error('Selecione uma aluna diferente da destino.');
      err.name = VALIDATION;
      throw err;
    }

    const [sourceOk, targetOk] = await Promise.all([
      this.setsToStudentsRepo.studentBelongsToTrainer(input.sourceStudentId, trainerSub),
      this.setsToStudentsRepo.studentBelongsToTrainer(targetStudentId, trainerSub),
    ]);

    if (!sourceOk || !targetOk) {
      const err = new Error('Aluna não encontrada ou não pertence a você.');
      err.name = FORBIDDEN;
      throw err;
    }

    const sourceLinks = await this.fetchAllStudentLinks(input.sourceStudentId);

    if (sourceLinks.length === 0) {
      const err = new Error('A aluna selecionada não possui rotinas disponíveis.');
      err.name = VALIDATION;
      throw err;
    }

    let copied = 0;
    let skipped = 0;
    let repsCopied = 0;
    let latestSetsId: number | null = null;

    for (const link of sourceLinks) {
      const alreadyLinked = await this.setsToStudentsRepo.studentHasLinkToSet(
        targetStudentId,
        link.sets_id
      );

      if (alreadyLinked) {
        skipped += 1;
        continue;
      }

      await this.setsToStudentsRepo.create({
        student_id: targetStudentId,
        sets_id: link.sets_id,
        validity: link.validity,
        status: link.status,
      });

      copied += 1;
      latestSetsId = link.sets_id;

      const trainingIds = parseSetTrainingOrder(link.set?.order ?? null);
      repsCopied += await this.copyRepsForTrainings(
        input.sourceStudentId,
        targetStudentId,
        trainingIds
      );
    }

    if (copied === 0 && skipped > 0) {
      const err = new Error('A aluna já possui todas as rotinas da origem selecionada.');
      err.name = VALIDATION;
      throw err;
    }

    if (copied > 0 && latestSetsId !== null) {
      await this.setAssignedNotifier.notifySetAssignedToStudent({
        trainerId: trainerSub,
        studentId: targetStudentId,
        trainerName,
        setsId: latestSetsId,
      });
    }

    return {
      copied,
      skipped,
      repsCopied,
      total: sourceLinks.length,
    };
  }

  private async fetchAllStudentLinks(studentId: string) {
    const items: Awaited<
      ReturnType<ISetsToStudentsRepository['listSetsByStudent']>
    >['items'] = [];
    let page = 1;

    while (true) {
      const response = await this.setsToStudentsRepo.listSetsByStudent(
        studentId,
        page,
        LINK_PAGE_SIZE
      );
      items.push(...response.items);

      if (response.page * response.pageSize >= response.total) {
        break;
      }

      page += 1;
    }

    return items;
  }

  private async copyRepsForTrainings(
    sourceStudentId: string,
    targetStudentId: string,
    trainingIds: number[]
  ): Promise<number> {
    let copied = 0;

    for (const trainingId of trainingIds) {
      const exerciseIds = await this.fetchExerciseIdsForTraining(trainingId);

      for (const exerciseId of exerciseIds) {
        const sourceRep = await this.repsToExercisesRepo.findByStudentAndExercise(
          sourceStudentId,
          exerciseId
        );

        if (!sourceRep) {
          continue;
        }

        const targetRep = await this.repsToExercisesRepo.findByStudentAndExercise(
          targetStudentId,
          exerciseId
        );

        if (targetRep) {
          await this.repsToExercisesRepo.update(targetRep.id, {
            reps: sourceRep.reps,
            obs: sourceRep.obs,
          });
        } else {
          await this.repsToExercisesRepo.create({
            exercise_id: exerciseId,
            student_id: targetStudentId,
            reps: sourceRep.reps,
            obs: sourceRep.obs,
          });
        }

        copied += 1;
      }
    }

    return copied;
  }

  private async fetchExerciseIdsForTraining(trainingId: number): Promise<number[]> {
    const ids: number[] = [];
    let page = 1;

    while (true) {
      const response = await this.exercisesToTrainingsRepo.listExercisesByTraining(
        trainingId,
        page,
        EXERCISE_PAGE_SIZE
      );

      ids.push(...response.items.map((item) => item.id));

      if (response.page * response.pageSize >= response.total) {
        break;
      }

      page += 1;
    }

    return ids;
  }
}
