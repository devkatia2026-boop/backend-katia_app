import { parseWellbeingCreateBody } from '../../parsing/wellbeing-body.parsing';
import type { IContentStudentsNotifier } from '../../ports/content-students-notifier.port';
import type { IWellbeingRepository, WellbeingDTO } from '../../ports/wellbeing.port';

export class CreateWellbeingUseCase {
  constructor(
    private readonly wellbeing: IWellbeingRepository,
    private readonly contentStudentsNotifier: IContentStudentsNotifier
  ) {}

  async execute(body: unknown): Promise<WellbeingDTO> {
    const input = parseWellbeingCreateBody(body);
    const created = await this.wellbeing.create(input);
    try {
      await this.contentStudentsNotifier.notifyWellbeingCreated(created.id);
    } catch (err) {
      console.error('[content-notifications] notifyWellbeingCreated:', err);
    }
    return created;
  }
}
