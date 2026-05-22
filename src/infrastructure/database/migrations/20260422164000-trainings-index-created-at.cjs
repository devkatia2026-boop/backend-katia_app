'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('trainings', ['created_at'], {
      name: 'trainings_created_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('trainings', 'trainings_created_at_idx');
  },
};
