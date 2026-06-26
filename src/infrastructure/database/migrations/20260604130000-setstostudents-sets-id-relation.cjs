'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('setstostudents', 'sets_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'sets', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.sequelize.query(`
      UPDATE setstostudents sts
      SET sets_id = st.set_id
      FROM setstotrainings st
      WHERE st.id = sts.setstotrainings_id
    `);

    const [[{ c: nullCount }]] = await queryInterface.sequelize.query(
      'SELECT COUNT(*)::int AS c FROM setstostudents WHERE sets_id IS NULL'
    );
    if (Number(nullCount) > 0) {
      throw new Error('[migration] sets_id não preenchido para todas as linhas em setstostudents.');
    }

    await queryInterface.removeIndex('setstostudents', 'uq_setstostudents_student_setstotrainings').catch(() => {});
    await queryInterface.removeIndex('setstostudents', ['setstotrainings_id']).catch(() => {});
    await queryInterface.removeColumn('setstostudents', 'setstotrainings_id');

    await queryInterface.changeColumn('setstostudents', 'sets_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'sets', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addIndex('setstostudents', ['sets_id']);
    await queryInterface.addIndex('setstostudents', ['student_id', 'sets_id'], {
      unique: true,
      name: 'uq_setstostudents_student_set',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('setstostudents', 'uq_setstostudents_student_set').catch(() => {});
    await queryInterface.removeIndex('setstostudents', ['sets_id']).catch(() => {});

    await queryInterface.addColumn('setstostudents', 'setstotrainings_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'setstotrainings', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.sequelize.query(`
      UPDATE setstostudents sts
      SET setstotrainings_id = (
        SELECT st.id
        FROM setstotrainings st
        WHERE st.set_id = sts.sets_id
        ORDER BY st.id ASC
        LIMIT 1
      )
    `);

    await queryInterface.removeColumn('setstostudents', 'sets_id');

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
};
