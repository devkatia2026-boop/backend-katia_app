import type { ISetsRepository, SetDTO } from '../../ports/sets.port';
import { parseSetPatchBody } from '../../parsing/set-body.parsing';

export class UpdateSetUseCase {
  constructor(private readonly sets: ISetsRepository) {}

  execute(setId: number, body: unknown): Promise<SetDTO> {
    const patch = parseSetPatchBody(body);
    return this.sets.update(setId, patch);
  }
}
