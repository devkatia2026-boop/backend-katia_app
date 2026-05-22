'use strict';

/** Listagens por inbox (student_id / trainer_id + ordenação created_at DESC). */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('notifications', ['student_id', 'created_at'], {
      name: 'notifications_student_created_at_idx',
    });
    await queryInterface.addIndex('notifications', ['trainer_id', 'created_at'], {
      name: 'notifications_trainer_created_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('notifications', 'notifications_student_created_at_idx');
    await queryInterface.removeIndex('notifications', 'notifications_trainer_created_at_idx');
  },
};
