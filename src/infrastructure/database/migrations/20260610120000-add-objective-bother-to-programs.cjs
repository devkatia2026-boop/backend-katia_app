'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('programs', 'objective', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('programs', 'bother', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('programs', 'bother');
    await queryInterface.removeColumn('programs', 'objective');
  },
};
