'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('notifications', 'student_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'students', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    await queryInterface.changeColumn('notifications', 'trainer_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'trainers', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    await queryInterface.sequelize.query(`
      ALTER TABLE notifications
      ADD CONSTRAINT notifications_at_least_one_recipient
      CHECK (student_id IS NOT NULL OR trainer_id IS NOT NULL);
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_at_least_one_recipient;'
    );
    await queryInterface.changeColumn('notifications', 'student_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'students', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    await queryInterface.changeColumn('notifications', 'trainer_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'trainers', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },
};
