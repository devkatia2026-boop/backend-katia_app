'use strict';

/** Melhora `ORDER BY created_at DESC` no listagem do feed. */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('posts', ['created_at'], { name: 'posts_created_at_idx' });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('posts', 'posts_created_at_idx');
  },
};
