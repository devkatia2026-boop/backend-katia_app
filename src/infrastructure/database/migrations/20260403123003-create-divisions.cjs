'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('divisions', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      student_id: {
        // students.id é UUID no seu schema atual
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'students', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      division: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('divisions', ['student_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('divisions');
  },
};

