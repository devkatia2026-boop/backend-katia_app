import type { ISetsRepository, SetDTO } from '../../ports/sets.port';
import { parseSetCreateBody } from '../../parsing/set-body.parsing';

export class CreateSetUseCase {
  constructor(private readonly sets: ISetsRepository) {}

  execute(body: unknown): Promise<SetDTO> {
    const input = parseSetCreateBody(body);
    return this.sets.create(input);
  }
}
