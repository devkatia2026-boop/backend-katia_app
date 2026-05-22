'use strict';

/** Melhora ordenação do catálogo de sets (`ORDER BY created_at DESC`). */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('sets', ['created_at'], {
      name: 'sets_created_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('sets', 'sets_created_at_idx');
  },
};
