import { parseWellbeingPatchBody } from '../../parsing/wellbeing-body.parsing';
import type { IWellbeingRepository, WellbeingDTO } from '../../ports/wellbeing.port';

export class UpdateWellbeingUseCase {
  constructor(private readonly wellbeing: IWellbeingRepository) {}

  execute(wellbeingId: number, body: unknown): Promise<WellbeingDTO> {
    const patch = parseWellbeingPatchBody(body);
    return this.wellbeing.update(wellbeingId, patch);
  }
}
