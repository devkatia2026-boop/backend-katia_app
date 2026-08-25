'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('repstotrainings', ['created_at'], {
      name: 'repstotrainings_created_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('repstotrainings', 'repstotrainings_created_at_idx');
  },
};
