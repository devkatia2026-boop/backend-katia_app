'use strict';

/** Ordenação `ORDER BY created_at DESC` na listagem de points. */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('points', ['created_at'], {
      name: 'points_created_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('points', 'points_created_at_idx');
  },
};
