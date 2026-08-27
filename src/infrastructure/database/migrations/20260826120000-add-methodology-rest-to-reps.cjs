'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('repstoexercises', 'methodology', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('repstoexercises', 'rest', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('repstotrainings', 'methodology', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('repstotrainings', 'rest', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('repstoexercises', 'rest');
    await queryInterface.removeColumn('repstoexercises', 'methodology');
    await queryInterface.removeColumn('repstotrainings', 'rest');
    await queryInterface.removeColumn('repstotrainings', 'methodology');
  },
};
