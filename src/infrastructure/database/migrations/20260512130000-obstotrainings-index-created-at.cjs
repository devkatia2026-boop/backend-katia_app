'use strict';

/** Ordenação `ORDER BY created_at DESC` nas listagens por treino. */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('obstotrainings', ['created_at'], {
      name: 'obstotrainings_created_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('obstotrainings', 'obstotrainings_created_at_idx');
  },
};
