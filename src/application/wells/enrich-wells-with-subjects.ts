import type { SubjectWellDTO } from '../ports/subject-wells.port';
import type { WellDTO, WellRowDTO } from '../ports/wells.port';

export function groupSubjectWellsByWellId(
  subjects: SubjectWellDTO[]
): Map<number, SubjectWellDTO[]> {
  const map = new Map<number, SubjectWellDTO[]>();

  for (const subject of subjects) {
    const current = map.get(subject.well_id);

    if (current) {
      current.push(subject);
      continue;
    }

    map.set(subject.well_id, [subject]);
  }

  return map;
}

export function enrichWellsWithSubjects(
  wells: WellRowDTO[],
  subjectsByWellId: Map<number, SubjectWellDTO[]>
): WellDTO[] {
  return wells.map((well) => ({
    ...well,
    subjects: subjectsByWellId.get(well.id) ?? [],
  }));
}