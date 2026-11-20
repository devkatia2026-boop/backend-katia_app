'use strict';

/** @param {import('sequelize').QueryInterface} queryInterface */
/** @param {import('sequelize').Sequelize} Sequelize */
/** @param {import('sequelize').QueryInterface} queryInterface */
async function indexExists(queryInterface, indexName) {
  const [rows] = await queryInterface.sequelize.query(
    `
      SELECT 1
      FROM pg_indexes
      WHERE schemaname = 'public' AND indexname = :indexName
      LIMIT 1
    `,
    { replacements: { indexName } }
  );
  return rows.length > 0;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('wellbeing');
    if (!Object.prototype.hasOwnProperty.call(desc, 'sort_order')) {
      await queryInterface.addColumn('wellbeing', 'sort_order', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }

    await queryInterface.sequelize.query(`
      WITH ordered AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC, id DESC) - 1 AS sort_position
        FROM wellbeing
      )
      UPDATE wellbeing AS w
      SET sort_order = ordered.sort_position
      FROM ordered
      WHERE w.id = ordered.id;
    `);

    if (!(await indexExists(queryInterface, 'wellbeing_sort_order_id_idx'))) {
      await queryInterface.addIndex('wellbeing', ['sort_order', 'id'], {
        name: 'wellbeing_sort_order_id_idx',
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('wellbeing', 'wellbeing_sort_order_id_idx');
    await queryInterface.removeColumn('wellbeing', 'sort_order');
  },
};