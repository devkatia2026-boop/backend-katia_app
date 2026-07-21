'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('revaluations', 'nutrition_rating', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('revaluations', 'nutrition_rating', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
};
