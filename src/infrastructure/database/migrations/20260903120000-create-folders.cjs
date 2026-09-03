'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('folders', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('folders', ['type'], {
      name: 'folders_type_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('folders');
  },
};
