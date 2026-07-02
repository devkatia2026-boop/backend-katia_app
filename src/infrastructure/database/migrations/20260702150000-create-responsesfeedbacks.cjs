'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('responsesfeedbacks', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      feedback_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'feedbacks', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      response: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('responsesfeedbacks', ['feedback_id', 'created_at'], {
      name: 'responsesfeedbacks_feedback_created_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('responsesfeedbacks');
  },
};
