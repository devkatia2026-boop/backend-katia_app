'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('folders', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'T',
    });

    await queryInterface.addIndex('folders', ['type'], {
      name: 'folders_type_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('folders', 'folders_type_idx');
    await queryInterface.removeColumn('folders', 'type');
  },
};
