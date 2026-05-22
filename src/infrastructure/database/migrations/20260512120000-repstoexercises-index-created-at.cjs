'use strict';

/** Ordenação `ORDER BY created_at DESC` nas listagens por exercício. */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('repstoexercises', ['created_at'], {
      name: 'repstoexercises_created_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('repstoexercises', 'repstoexercises_created_at_idx');
  },
};
