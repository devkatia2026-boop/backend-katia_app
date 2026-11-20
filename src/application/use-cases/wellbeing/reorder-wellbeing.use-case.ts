import { parseWellbeingReorderBody } from '../../parsing/wellbeing-reorder.parsing';
import type { IWellbeingRepository } from '../../ports/wellbeing.port';

export class ReorderWellbeingUseCase {
  constructor(private readonly wellbeing: IWellbeingRepository) {}

  execute(body: unknown): Promise<void> {
    const { wellbeingId, direction } = parseWellbeingReorderBody(body);
    return this.wellbeing.reorderByDirection(wellbeingId, direction);
  }
}