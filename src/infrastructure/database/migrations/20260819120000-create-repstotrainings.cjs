'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('repstotrainings', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      exercise_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'exercises', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      training_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'trainings', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      reps: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      obs: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('repstotrainings', ['exercise_id']);
    await queryInterface.addIndex('repstotrainings', ['training_id']);
    await queryInterface.addIndex('repstotrainings', ['exercise_id', 'training_id'], {
      name: 'repstotrainings_exercise_training_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('repstotrainings');
  },
};
