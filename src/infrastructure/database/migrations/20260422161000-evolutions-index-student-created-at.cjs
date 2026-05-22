'use strict';

/** Otimiza listagem por aluna ordenada por data (DESC). */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('evolutions', ['student_id', 'created_at'], {
      name: 'evolutions_student_id_created_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('evolutions', 'evolutions_student_id_created_at_idx');
  },
};
