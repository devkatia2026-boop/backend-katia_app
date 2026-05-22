'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('exercisestotrainings', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      training_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'trainings', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      exercise_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'exercises', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('exercisestotrainings', ['training_id']);
    await queryInterface.addIndex('exercisestotrainings', ['exercise_id']);
    await queryInterface.addIndex('exercisestotrainings', ['training_id', 'exercise_id'], {
      unique: true,
      name: 'uq_exercisestotrainings_training_exercise',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('exercisestotrainings');
  },
};

