'use strict';

/**
 * setstostudents: set_id → setstotrainings_id; nova coluna validity.
 * Backfill de setstotrainings via menor training_id quando há linhas em setstostudents.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('setstostudents', 'validity', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('setstostudents', 'setstotrainings_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    const [countRows] = await queryInterface.sequelize.query(
      'SELECT COUNT(*)::int AS c FROM setstostudents'
    );
    const rowCount = Number((countRows[0] && countRows[0].c) ?? 0);

    if (rowCount > 0) {
      const [tidRows] = await queryInterface.sequelize.query(
        'SELECT MIN(id) AS tid FROM trainings'
      );
      const tid = tidRows[0]?.tid != null ? Number(tidRows[0].tid) : null;
      if (tid == null || Number.isNaN(tid)) {
        throw new Error(
          '[migration] Existem linhas em setstostudents mas nenhum training; cadastre um training antes.'
        );
      }

      await queryInterface.sequelize.query(
        `
        INSERT INTO setstotrainings (training_id, set_id, created_at)
        SELECT :tid, d.set_id, CURRENT_TIMESTAMP
        FROM (SELECT DISTINCT set_id FROM setstostudents) d
        WHERE NOT EXISTS (
          SELECT 1 FROM setstotrainings st
          WHERE st.training_id = :tid AND st.set_id = d.set_id
        )
      `,
        { replacements: { tid } }
      );

      await queryInterface.sequelize.query(
        `
        UPDATE setstostudents sts
        SET setstotrainings_id = st.id
        FROM setstotrainings st
        WHERE st.training_id = :tid AND st.set_id = sts.set_id
      `,
        { replacements: { tid } }
      );

      const [badRows] = await queryInterface.sequelize.query(
        'SELECT COUNT(*)::int AS c FROM setstostudents WHERE setstotrainings_id IS NULL'
      );
      if (Number((badRows[0] && badRows[0].c) ?? 0) > 0) {
        throw new Error('[migration] setstotrainings_id não preenchido para todas as linhas.');
      }
    }

    await queryInterface.removeIndex('setstostudents', 'uq_setstostudents_student_set').catch(() => {});

    await queryInterface.removeIndex('setstostudents', ['set_id']).catch(() => {});
    await queryInterface.removeColumn('setstostudents', 'set_id');

    await queryInterface.changeColumn('setstostudents', 'setstotrainings_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'setstotrainings', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addIndex('setstostudents', ['setstotrainings_id']);
    await queryInterface.addIndex('setstostudents', ['student_id', 'setstotrainings_id'], {
      unique: true,
      name: 'uq_setstostudents_student_setstotrainings',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('setstostudents', 'uq_setstostudents_student_setstotrainings').catch(() => {});
    await queryInterface.removeIndex('setstostudents', ['setstotrainings_id']).catch(() => {});

    await queryInterface.removeColumn('setstostudents', 'setstotrainings_id');
    await queryInterface.removeColumn('setstostudents', 'validity');

    await queryInterface.addColumn('setstostudents', 'set_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'sets', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addIndex('setstostudents', ['set_id']);
    await queryInterface.addIndex('setstostudents', ['student_id', 'set_id'], {
      unique: true,
      name: 'uq_setstostudents_student_set',
    });
  },
};
