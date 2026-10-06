'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('methodprograms', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('methods', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      method_program_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'methodprograms', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      link: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('methods', ['method_program_id'], {
      name: 'methods_method_program_id_idx',
    });
    await queryInterface.addIndex('methods', ['method_program_id', 'created_at'], {
      name: 'methods_method_program_created_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('methods');
    await queryInterface.dropTable('methodprograms');
  },
};
