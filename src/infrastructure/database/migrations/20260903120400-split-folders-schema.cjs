'use strict';

module.exports = {
  async up(queryInterface) {
    const [columns] = await queryInterface.sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'folders'
        AND column_name IN ('training_id', 'exercise_id', 'set_id', 'type')
    `);

    if (columns.length === 0) {
      return;
    }

    const indexNames = [
      'folders_type',
      'folders_training_id',
      'folders_exercise_id',
      'folders_set_id',
    ];

    for (const indexName of indexNames) {
      await queryInterface.sequelize.query(`DROP INDEX IF EXISTS "${indexName}"`);
    }

    await queryInterface.removeColumn('folders', 'training_id');
    await queryInterface.removeColumn('folders', 'exercise_id');
    await queryInterface.removeColumn('folders', 'set_id');
    await queryInterface.removeColumn('folders', 'type');
  },

  async down(queryInterface, Sequelize) {
    const [columns] = await queryInterface.sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'folders'
        AND column_name = 'type'
    `);

    if (columns.length > 0) {
      return;
    }

    await queryInterface.addColumn('folders', 'training_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'trainings', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    await queryInterface.addColumn('folders', 'exercise_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'exercises', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    await queryInterface.addColumn('folders', 'set_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'sets', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    await queryInterface.addColumn('folders', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'T',
    });

    await queryInterface.addIndex('folders', ['type']);
    await queryInterface.addIndex('folders', ['training_id']);
    await queryInterface.addIndex('folders', ['exercise_id']);
    await queryInterface.addIndex('folders', ['set_id']);
  },
};
