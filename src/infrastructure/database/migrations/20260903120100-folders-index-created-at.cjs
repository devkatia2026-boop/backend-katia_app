'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('folders', ['created_at'], {
      name: 'folders_created_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('folders', 'folders_created_at_idx');
  },
};
