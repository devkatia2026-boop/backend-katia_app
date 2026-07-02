import { Op } from 'sequelize';
import type { Sequelize } from 'sequelize';
import type { DatabaseModels } from './models';
import type { IStudentAccountRepository } from '../../application/ports/student-account.port';

export class SequelizeStudentAccountRepository implements IStudentAccountRepository {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly models: DatabaseModels
  ) {}

  async deleteAllDataForStudent(studentId: string): Promise<void> {
    await this.sequelize.transaction(async (transaction) => {
      const feedbackRows = await this.models.Feedback.findAll({
        attributes: ['id'],
        where: { student_id: studentId },
        transaction,
        raw: true,
      });
      const feedbackIds = feedbackRows.map((row) => (row as { id: number }).id);

      if (feedbackIds.length > 0) {
        await this.models.ResponsesFeedback.destroy({
          where: { feedback_id: { [Op.in]: feedbackIds } },
          transaction,
        });
      }

      await this.models.Feedback.destroy({ where: { student_id: studentId }, transaction });
      await this.models.Notification.destroy({ where: { student_id: studentId }, transaction });

      const postRows = await this.models.Post.findAll({
        attributes: ['id'],
        where: { author_id: studentId, author_type: 'student' },
        transaction,
        raw: true,
      });
      const postIds = postRows.map((row) => (row as { id: number }).id);

      if (postIds.length > 0) {
        await this.models.Comment.destroy({ where: { post_id: { [Op.in]: postIds } }, transaction });
        await this.models.Like.destroy({ where: { post_id: { [Op.in]: postIds } }, transaction });
        await this.models.Post.destroy({ where: { id: { [Op.in]: postIds } }, transaction });
      }

      await this.models.Comment.destroy({
        where: { author_id: studentId, author_type: 'student' },
        transaction,
      });
      await this.models.Like.destroy({
        where: { author_id: studentId, author_type: 'student' },
        transaction,
      });
      await this.models.Point.destroy({ where: { student_id: studentId }, transaction });
      await this.models.ObsToTrainings.destroy({ where: { student_id: studentId }, transaction });
      await this.models.RepsToExercises.destroy({ where: { student_id: studentId }, transaction });
      await this.models.SetsToStudents.destroy({ where: { student_id: studentId }, transaction });
      await this.models.ProgramsToStudents.destroy({ where: { student_id: studentId }, transaction });
      await this.models.Division.destroy({ where: { student_id: studentId }, transaction });
      await this.models.Evolution.destroy({ where: { student_id: studentId }, transaction });
      await this.models.Conversation.destroy({ where: { student_id: studentId }, transaction });
      await this.models.Physical.destroy({ where: { student_id: studentId }, transaction });
      await this.models.AnamnesisExclusive.destroy({ where: { student_id: studentId }, transaction });
      await this.models.Anamnesis.destroy({ where: { student_id: studentId }, transaction });
      await this.models.Student.destroy({ where: { id: studentId }, transaction });
    });
  }
}
