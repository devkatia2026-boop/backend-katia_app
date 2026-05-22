'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('exercisestoprograms', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      program_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'programs', key: 'id' },
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

    await queryInterface.addIndex('exercisestoprograms', ['program_id']);
    await queryInterface.addIndex('exercisestoprograms', ['exercise_id']);
    await queryInterface.addIndex('exercisestoprograms', ['program_id', 'exercise_id'], {
      unique: true,
      name: 'uq_exercisestoprograms_program_exercise',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('exercisestoprograms');
  },
};

