'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('repstoexercises', {
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
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'students', key: 'id' },
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

    await queryInterface.addIndex('repstoexercises', ['exercise_id']);
    await queryInterface.addIndex('repstoexercises', ['student_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('repstoexercises');
  },
};
