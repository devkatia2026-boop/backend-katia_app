import { parseWellbeingCreateBody } from '../../parsing/wellbeing-body.parsing';
import type { IWellbeingRepository, WellbeingDTO } from '../../ports/wellbeing.port';

export class CreateWellbeingUseCase {
  constructor(private readonly wellbeing: IWellbeingRepository) {}

  execute(body: unknown): Promise<WellbeingDTO> {
    const input = parseWellbeingCreateBody(body);
    return this.wellbeing.create(input);
  }
}
