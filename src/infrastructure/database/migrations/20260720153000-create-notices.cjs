'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notices', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      trainer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'trainers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      type_plan: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('notices', ['trainer_id', 'created_at'], {
      name: 'notices_trainer_created_at_idx',
    });
    await queryInterface.addIndex('notices', ['type_plan', 'created_at'], {
      name: 'notices_type_plan_created_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('notices');
  },
};
