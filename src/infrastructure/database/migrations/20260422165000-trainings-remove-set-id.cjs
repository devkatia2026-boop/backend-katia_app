'use strict';

/** Remove vínculo trainings → sets; trainings passam a existir sem conjunto. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeIndex('trainings', ['set_id']);
    await queryInterface.removeColumn('trainings', 'set_id');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('trainings', 'set_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'sets', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    await queryInterface.addIndex('trainings', ['set_id']);
  },
};
