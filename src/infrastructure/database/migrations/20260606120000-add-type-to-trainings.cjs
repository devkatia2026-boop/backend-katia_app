'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('trainings', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'ambos',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('trainings', 'type');
  },
};
