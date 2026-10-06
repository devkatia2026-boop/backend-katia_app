'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('introductions', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      program_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'programs', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('contents', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      introduction_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'introductions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      link: {
        type: Sequelize.TEXT,
        allowNull: false,
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

    await queryInterface.addIndex('introductions', ['program_id', 'created_at'], {
      name: 'introductions_program_created_at_idx',
    });
    await queryInterface.addIndex('contents', ['introduction_id', 'created_at'], {
      name: 'contents_introduction_created_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('contents');
    await queryInterface.dropTable('introductions');
  },
};
