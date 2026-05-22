'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('setstostudents', {
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
      set_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'sets', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('setstostudents', ['student_id']);
    await queryInterface.addIndex('setstostudents', ['set_id']);
    await queryInterface.addIndex('setstostudents', ['student_id', 'set_id'], {
      unique: true,
      name: 'uq_setstostudents_student_set',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('setstostudents');
  },
};

