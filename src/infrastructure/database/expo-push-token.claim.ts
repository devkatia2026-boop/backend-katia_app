import { Op } from 'sequelize';

import type { DatabaseModels } from './models';

export type ExpoPushTokenOwnerRole = 'trainer' | 'student';

export async function claimExpoPushToken(
  models: Pick<DatabaseModels, 'Trainer' | 'Student'>,
  ownerId: string,
  ownerRole: ExpoPushTokenOwnerRole,
  token: string | null | undefined
): Promise<void> {
  const normalized = token?.trim() ?? '';

  if (normalized.length === 0) {
    if (ownerRole === 'trainer') {
      await models.Trainer.update({ expo_push_token: null }, { where: { id: ownerId } });
      return;
    }

    await models.Student.update({ expo_push_token: null }, { where: { id: ownerId } });
    return;
  }

  await models.Trainer.update(
    { expo_push_token: null },
    {
      where: {
        expo_push_token: normalized,
        ...(ownerRole === 'trainer' ? { id: { [Op.ne]: ownerId } } : {}),
      },
    }
  );

  await models.Student.update(
    { expo_push_token: null },
    {
      where: {
        expo_push_token: normalized,
        ...(ownerRole === 'student' ? { id: { [Op.ne]: ownerId } } : {}),
      },
    }
  );

  if (ownerRole === 'trainer') {
    await models.Trainer.update({ expo_push_token: normalized }, { where: { id: ownerId } });
    return;
  }

  await models.Student.update({ expo_push_token: normalized }, { where: { id: ownerId } });
}
