'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('repstoexercises', 'training_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'trainings', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.sequelize.query(`
      UPDATE repstoexercises AS r
      SET training_id = sub.training_id
      FROM (
        SELECT DISTINCT ON (ett.exercise_id)
          ett.exercise_id,
          ett.training_id
        FROM exercisestotrainings AS ett
        ORDER BY ett.exercise_id, ett.id ASC
      ) AS sub
      WHERE r.exercise_id = sub.exercise_id
        AND r.training_id IS NULL
    `);

    await queryInterface.sequelize.query(
      'DELETE FROM repstoexercises WHERE training_id IS NULL'
    );

    await queryInterface.changeColumn('repstoexercises', 'training_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'trainings', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addIndex('repstoexercises', ['training_id']);
    await queryInterface.addIndex('repstoexercises', ['exercise_id', 'training_id', 'student_id'], {
      name: 'repstoexercises_exercise_training_student_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      'repstoexercises',
      'repstoexercises_exercise_training_student_idx'
    );
    await queryInterface.removeIndex('repstoexercises', ['training_id']);
    await queryInterface.removeColumn('repstoexercises', 'training_id');
  },
};
