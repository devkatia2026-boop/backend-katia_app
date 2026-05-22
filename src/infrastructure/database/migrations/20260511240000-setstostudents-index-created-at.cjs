'use strict';

/** Melhora ordenação dos vínculos aluna↔setstotrainings (`ORDER BY created_at DESC`). */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('setstostudents', ['created_at'], {
      name: 'setstostudents_created_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('setstostudents', 'setstostudents_created_at_idx');
  },
};
