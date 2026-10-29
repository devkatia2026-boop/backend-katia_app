import { Op } from 'sequelize';
import type { DatabaseModels } from './models';
import type { IRestrictionTargetsLookup } from '../../application/ports/restriction-targets.port';

function normalizeId(id: string): string {
  return id.trim().toLowerCase();
}

export class SequelizeRestrictionTargetsLookup implements IRestrictionTargetsLookup {
  constructor(private readonly models: Pick<DatabaseModels, 'Student' | 'Trainer'>) {}

  async studentExists(studentId: string): Promise<boolean> {
    const n = await this.models.Student.count({ where: { id: normalizeId(studentId) } });
    return n > 0;
  }

  async trainerExists(trainerId: string): Promise<boolean> {
    const n = await this.models.Trainer.count({ where: { id: normalizeId(trainerId) } });
    return n > 0;
  }

  async resolveDisplayName(
    userType: 'student' | 'trainer',
    userId: string
  ): Promise<string | null> {
    const map = await this.resolveDisplayNameMap(
      userType === 'student' ? [userId] : [],
      userType === 'trainer' ? [userId] : []
    );
    return map.get(`${userType}:${normalizeId(userId)}`) ?? null;
  }

  async resolveDisplayNameMap(
    studentIds: string[],
    trainerIds: string[]
  ): Promise<Map<string, string>> {
    const out = new Map<string, string>();
    const students = [...new Set(studentIds.map(normalizeId))].filter(Boolean);
    const trainers = [...new Set(trainerIds.map(normalizeId))].filter(Boolean);

    if (students.length > 0) {
      const rows = (await this.models.Student.findAll({
        where: { id: { [Op.in]: students } },
        attributes: ['id', 'full_name'],
        raw: true,
      })) as { id: string; full_name?: string }[];
      for (const row of rows) {
        const name = row.full_name?.trim();
        if (name) out.set(`student:${normalizeId(row.id)}`, name);
      }
    }

    if (trainers.length > 0) {
      const rows = (await this.models.Trainer.findAll({
        where: { id: { [Op.in]: trainers } },
        attributes: ['id', 'full_name'],
        raw: true,
      })) as { id: string; full_name?: string }[];
      for (const row of rows) {
        const name = row.full_name?.trim();
        if (name) out.set(`trainer:${normalizeId(row.id)}`, name);
      }
    }

    return out;
  }
}
