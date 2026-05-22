import type { IUserMeReader, MeResult } from '../../ports/user-me-reader.port';
import type {
  IUserProfileUpdater,
  StudentProfileUpdateValues,
  TrainerProfileUpdateValues,
} from '../../ports/user-profile-updater.port';
import type {
  AuthUserAttributesPatch,
  CognitoUpdatableAttribute,
  IAuthUserAttributesUpdater,
} from '../../ports/auth-user-attributes-updater.port';
import { parseMyProfileBody } from '../../parsing/profile-body.parsing';

const PROFILE_NOT_FOUND = 'ProfileNotFoundException';
const VALIDATION = 'ValidationException';

export class UpdateMyProfileUseCase {
  constructor(
    private readonly userMeReader: IUserMeReader,
    private readonly userProfileUpdater: IUserProfileUpdater,
    private readonly authUserAttributesUpdater: IAuthUserAttributesUpdater
  ) {}

  async execute(cognitoSub: string, accessToken: string, body: unknown): Promise<MeResult> {
    const { common, studentExtra } = parseMyProfileBody(body);
    const hasCommon = Object.keys(common).length > 0;
    const hasStudentExtra = Object.keys(studentExtra).length > 0;
    if (!hasCommon && !hasStudentExtra) {
      const err = new Error('Informe ao menos um campo para atualizar.');
      err.name = VALIDATION;
      throw err;
    }

    const current = await this.userMeReader.findByCognitoId(cognitoSub);
    if (!current) {
      const err = new Error('Usuário não encontrado na base local.');
      err.name = PROFILE_NOT_FOUND;
      throw err;
    }

    // 1) Atualiza atributos no Cognito (fonte de verdade de autenticação), se aplicável.
    // Mantém consistência: se Cognito falhar, não atualiza o DB.
    const { patch, toDelete } = this.buildCognitoPatch(common);
    if (Object.keys(patch).length > 0) {
      await this.authUserAttributesUpdater.updateAttributes(accessToken, patch);
    }
    if (toDelete.length > 0) {
      await this.authUserAttributesUpdater.deleteAttributes(accessToken, toDelete);
    }

    if (current.role === 'trainer') {
      if (hasStudentExtra) {
        const err = new Error('Campos exclusivos de aluno não se aplicam ao perfil de treinador.');
        err.name = VALIDATION;
        throw err;
      }
      if (!hasCommon) {
        const err = new Error('Informe ao menos um campo para atualizar.');
        err.name = VALIDATION;
        throw err;
      }
      await this.userProfileUpdater.updateTrainerProfile(cognitoSub, common);
    } else {
      const merged: StudentProfileUpdateValues = { ...common, ...studentExtra };
      await this.userProfileUpdater.updateStudentProfile(cognitoSub, merged);
    }

    const updated = await this.userMeReader.findByCognitoId(cognitoSub);
    if (!updated) {
      const err = new Error('Usuário não encontrado na base local.');
      err.name = PROFILE_NOT_FOUND;
      throw err;
    }
    return updated;
  }

  private buildCognitoPatch(common: TrainerProfileUpdateValues): {
    patch: AuthUserAttributesPatch;
    toDelete: CognitoUpdatableAttribute[];
  } {
    const patch: AuthUserAttributesPatch = {};
    const toDelete: CognitoUpdatableAttribute[] = [];

    if (common.full_name !== undefined) {
      patch.name = common.full_name;
    }
    if (common.email !== undefined) {
      patch.email = common.email;
    }
    if (common.phone !== undefined) {
      if (common.phone === null) {
        toDelete.push('phone_number');
      } else {
        patch.phone_number = common.phone;
      }
    }

    return { patch, toDelete };
  }
}
