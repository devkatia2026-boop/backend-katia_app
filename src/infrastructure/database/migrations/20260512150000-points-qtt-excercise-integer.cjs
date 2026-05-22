'use strict';

/**
 * Converte `qtt_excercise` de VARCHAR para INTEGER (PostgreSQL).
 * Valores não numéricos viram NULL.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE points
      ALTER COLUMN qtt_excercise TYPE integer USING (
        CASE
          WHEN qtt_excercise IS NULL OR trim(qtt_excercise::text) = '' THEN NULL
          WHEN trim(qtt_excercise::text) ~ '^[0-9]+$' THEN trim(qtt_excercise::text)::integer
          ELSE NULL
        END
      );
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('points', 'qtt_excercise', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
