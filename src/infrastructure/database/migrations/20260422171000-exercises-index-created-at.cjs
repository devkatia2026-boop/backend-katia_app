'use strict';

/** Melhora ordenação do catálogo de exercícios (`ORDER BY created_at DESC`). */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('exercises', ['created_at'], {
      name: 'exercises_created_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('exercises', 'exercises_created_at_idx');
  },
};

