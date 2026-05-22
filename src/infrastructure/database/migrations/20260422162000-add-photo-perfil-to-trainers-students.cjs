'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('trainers', 'photo_perfil', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('students', 'photo_perfil', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('students', 'photo_perfil');
    await queryInterface.removeColumn('trainers', 'photo_perfil');
  },
};
