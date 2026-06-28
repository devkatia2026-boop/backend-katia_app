'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('programs', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.changeColumn('exercises', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('programs', 'description', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('exercises', 'description', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
