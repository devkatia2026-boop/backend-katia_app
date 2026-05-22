'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('setstotrainings', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      training_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'trainings', key: 'id' },
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

    await queryInterface.addIndex('setstotrainings', ['training_id']);
    await queryInterface.addIndex('setstotrainings', ['set_id']);
    await queryInterface.addIndex('setstotrainings', ['training_id', 'set_id'], {
      unique: true,
      name: 'uq_setstotrainings_training_set',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('setstotrainings');
  },
};
