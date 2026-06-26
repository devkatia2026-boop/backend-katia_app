'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('trainings', 'time', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 45,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('trainings', 'time');
  },
};
