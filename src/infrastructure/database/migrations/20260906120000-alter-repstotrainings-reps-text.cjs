'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('repstotrainings', 'reps', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('repstotrainings', 'reps', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
