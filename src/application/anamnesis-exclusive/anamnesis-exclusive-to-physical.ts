import type { AnamnesisExclusiveUpsertValues } from '../ports/anamnesis-exclusive.port';
import type { PhysicalUpsertValues } from '../ports/student-physicals.port';

export function mapAnamnesisExclusiveToPhysical(
  values: AnamnesisExclusiveUpsertValues
): PhysicalUpsertValues {
  const out: PhysicalUpsertValues = {};
  if ('weight' in values) out.weight = values.weight ?? null;
  if ('heigth' in values) out.height = values.heigth ?? null;
  if ('objective' in values) out.objective = values.objective ?? null;
  return out;
}
