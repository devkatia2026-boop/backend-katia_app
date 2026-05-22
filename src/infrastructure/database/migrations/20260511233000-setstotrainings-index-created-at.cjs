'use strict';

/** Melhora ordenação dos vínculos set↔treino (`ORDER BY created_at DESC`). */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('setstotrainings', ['created_at'], {
      name: 'setstotrainings_created_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('setstotrainings', 'setstotrainings_created_at_idx');
  },
};
