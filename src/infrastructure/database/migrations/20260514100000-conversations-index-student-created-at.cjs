'use strict';

/** Listagem cronológica (paginada DESC) por aluna na conversa. */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('conversations', ['student_id', 'created_at'], {
      name: 'conversations_student_created_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('conversations', 'conversations_student_created_at_idx');
  },
};
