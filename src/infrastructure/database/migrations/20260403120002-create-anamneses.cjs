'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('anamneses', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'students', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      main_objective: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      place_training: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      days_for_week: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      level_experience: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('anamneses', ['student_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('anamneses');
  },
};
