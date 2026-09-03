'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('folderstotype', ['created_at'], {
      name: 'folderstotype_created_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('folderstotype', 'folderstotype_created_at_idx');
  },
};
