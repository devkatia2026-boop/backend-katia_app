import type { Student } from './models/student.model';
import type { DatabaseModels } from './models';
import { applyWasExclusiveOnStudentProfileUpdate } from '../../application/student-plan/student-was-exclusive';
import type {
  EduzzStudentPlanClearedValues,
  EduzzStudentPlanPaidValues,
  IEduzzStudentPlanRepository,
} from '../../application/ports/eduzz-webhook.port';

export class SequelizeEduzzStudentPlanRepository implements IEduzzStudentPlanRepository {
  constructor(private readonly models: Pick<DatabaseModels, 'Student'>) {}

  async findStudentIdByEmail(email: string): Promise<string | null> {
    const student = await this.findStudentByEmail(email);
    return student?.id ?? null;
  }

  async applyPaidPlanByEmail(
    email: string,
    values: EduzzStudentPlanPaidValues
  ): Promise<{ student_id: string } | null> {
    const student = await this.findStudentByEmail(email);
    if (!student) {
      return null;
    }

    const patch = applyWasExclusiveOnStudentProfileUpdate({
      type_plan: values.type_plan,
    });

    await student.update({
      type_plan: values.type_plan,
      validation: values.validation,
      validation_plan: values.validation_plan,
      ...patch,
    });

    return { student_id: student.id };
  }

  async clearPlanByEmail(email: string): Promise<{ student_id: string } | null> {
    const student = await this.findStudentByEmail(email);
    if (!student) {
      return null;
    }

    const cleared: EduzzStudentPlanClearedValues = {
      type_plan: null,
      validation: 'nao',
      validation_plan: null,
    };

    await student.update(cleared);
    return { student_id: student.id };
  }

  private async findStudentByEmail(email: string): Promise<Student | null> {
    return this.models.Student.findOne({
      where: { email: email.trim().toLowerCase() },
    });
  }
}
