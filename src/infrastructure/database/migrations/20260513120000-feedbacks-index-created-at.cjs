'use strict';

/** Listagem ordenada por created_at. */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('feedbacks', ['created_at'], {
      name: 'feedbacks_created_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('feedbacks', 'feedbacks_created_at_idx');
  },
};
