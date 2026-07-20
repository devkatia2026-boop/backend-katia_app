'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('students', 'in_revalution', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.createTable('revaluations', {
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
      front_photo: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      side_photo: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      back_photo: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      current_weight: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      monthly_rating: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      biggest_achievement: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      biggest_challenge: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      training_fit_routine: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      favorite_workout: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      least_favorite_or_difficult_exercise: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      nutrition_rating: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      energy_rating: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      body_changes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      pain_or_adjustments: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      next_month_goal: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      proudest_moment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('revaluations', ['student_id', 'created_at'], {
      name: 'revaluations_student_created_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('revaluations');
    await queryInterface.removeColumn('students', 'in_revalution');
  },
};
