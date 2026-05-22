'use strict';

/** Melhora ordenação dos vínculos exercício↔treino (`ORDER BY created_at DESC`). */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('exercisestotrainings', ['created_at'], {
      name: 'exercisestotrainings_created_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      'exercisestotrainings',
      'exercisestotrainings_created_at_idx'
    );
  },
};
