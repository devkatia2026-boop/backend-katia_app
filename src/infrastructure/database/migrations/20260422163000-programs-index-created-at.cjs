'use strict';

/** Melhora ordenação do catálogo de programas (`ORDER BY created_at DESC`). */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('programs', ['created_at'], {
      name: 'programs_created_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('programs', 'programs_created_at_idx');
  },
};
