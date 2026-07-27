'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('students', 'was_exclusive', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.sequelize.query(`
      UPDATE students
      SET was_exclusive = true
      WHERE lower(trim(type_plan)) IN ('exclusive', 'consultoria-exclusiva');
    `);

    await queryInterface.addColumn('trainers', 'semester_promotion', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.createTable('version', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      version: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('version');
    await queryInterface.removeColumn('trainers', 'semester_promotion');
    await queryInterface.removeColumn('students', 'was_exclusive');
  },
};
