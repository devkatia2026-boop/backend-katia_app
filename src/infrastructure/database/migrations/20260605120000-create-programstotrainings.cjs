'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('programstotrainings', {
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
      training_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'trainings', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('programstotrainings', ['program_id']);
    await queryInterface.addIndex('programstotrainings', ['training_id']);
    await queryInterface.addIndex('programstotrainings', ['program_id', 'training_id'], {
      unique: true,
      name: 'uq_programstotrainings_program_training',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('programstotrainings');
  },
};
