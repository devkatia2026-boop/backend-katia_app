import type { AnamnesisDTO, IStudentAnamnesisRepository } from '../ports/student-anamnesis.port';
import type { AnamnesisProgramComparable } from './program-anamnesis-match';

const NOT_FOUND = 'NotFoundException';

export type ProgramMatchAuth = {
  role: 'student' | 'trainer';
  sub: string;
};

export type StudentMatchProfile = {
  anamnesis_id: number;
  comparable: AnamnesisProgramComparable;
};

function buildComparableFromAnamnesis(anamnesis: AnamnesisDTO): AnamnesisProgramComparable {
  return {
    place_training: anamnesis.place_training,
    level_experience: anamnesis.level_experience,
    main_objective: anamnesis.main_objective,
    bother: anamnesis.bother,
  };
}

export async function loadStudentMatchProfile(
  studentId: string,
  auth: ProgramMatchAuth,
  anamnesisRepo: IStudentAnamnesisRepository
): Promise<StudentMatchProfile> {
  const anamnesis =
    auth.role === 'trainer'
      ? await anamnesisRepo.findLatestForTrainerStudent(auth.sub, studentId)
      : await anamnesisRepo.findLatestByStudentId(studentId);

  if (!anamnesis) {
    const err = new Error('Anamnese não encontrada.');
    err.name = NOT_FOUND;
    throw err;
  }

  return {
    anamnesis_id: anamnesis.id,
    comparable: buildComparableFromAnamnesis(anamnesis),
  };
}
