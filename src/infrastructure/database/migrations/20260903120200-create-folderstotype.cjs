'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('folderstotype', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      folder_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'folders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      training_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'trainings', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      exercise_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'exercises', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      set_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'sets', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('folderstotype', ['folder_id']);
    await queryInterface.addIndex('folderstotype', ['type']);
    await queryInterface.addIndex('folderstotype', ['training_id']);
    await queryInterface.addIndex('folderstotype', ['exercise_id']);
    await queryInterface.addIndex('folderstotype', ['set_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('folderstotype');
  },
};
