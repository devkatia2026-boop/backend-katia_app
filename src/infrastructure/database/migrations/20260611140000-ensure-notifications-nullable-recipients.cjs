'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'notifications'
            AND column_name = 'student_id'
            AND is_nullable = 'NO'
        ) THEN
          ALTER TABLE notifications ALTER COLUMN student_id DROP NOT NULL;
        END IF;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'notifications'
            AND column_name = 'trainer_id'
            AND is_nullable = 'NO'
        ) THEN
          ALTER TABLE notifications ALTER COLUMN trainer_id DROP NOT NULL;
        END IF;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'notifications_at_least_one_recipient'
        ) THEN
          ALTER TABLE notifications
          ADD CONSTRAINT notifications_at_least_one_recipient
          CHECK (student_id IS NOT NULL OR trainer_id IS NOT NULL);
        END IF;
      END $$;
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
