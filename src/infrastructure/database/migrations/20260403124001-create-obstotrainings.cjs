'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('obstotrainings', {
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
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'students', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      obs: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('obstotrainings', ['training_id']);
    await queryInterface.addIndex('obstotrainings', ['student_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('obstotrainings');
  },
};
