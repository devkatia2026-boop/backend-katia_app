'use strict';

/** @param {import('sequelize').QueryInterface} queryInterface */
async function columnExists(queryInterface, tableName, columnName) {
  const desc = await queryInterface.describeTable(tableName);
  return Object.prototype.hasOwnProperty.call(desc, columnName);
}

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
    if (!(await columnExists(queryInterface, 'exercisestotrainings', 'sort_order'))) {
      await queryInterface.addColumn('exercisestotrainings', 'sort_order', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }

    await queryInterface.sequelize.query(`
      WITH ordered AS (
        SELECT id, training_id,
          ROW_NUMBER() OVER (PARTITION BY training_id ORDER BY id ASC) - 1 AS sort_position
        FROM exercisestotrainings
      )
      UPDATE exercisestotrainings AS ett
      SET sort_order = ordered.sort_position
      FROM ordered
      WHERE ett.id = ordered.id;
    `);

    await queryInterface.sequelize.query(`
      DELETE FROM exercisestotrainings AS ett
      WHERE ett.id IN (
        SELECT id FROM (
          SELECT id,
            ROW_NUMBER() OVER (PARTITION BY training_id, exercise_id ORDER BY id ASC) AS rn
          FROM exercisestotrainings
        ) ranked
        WHERE ranked.rn > 1
      );
    `);

    if (await indexExists(queryInterface, 'uq_exercisestotrainings_training_exercise')) {
      await queryInterface.removeIndex(
        'exercisestotrainings',
        'uq_exercisestotrainings_training_exercise'
      );
    }

    if (!(await indexExists(queryInterface, 'exercisestotrainings_training_sort_idx'))) {
      await queryInterface.addIndex('exercisestotrainings', ['training_id', 'sort_order', 'id'], {
        name: 'exercisestotrainings_training_sort_idx',
      });
    }

    if (!(await columnExists(queryInterface, 'repstotrainings', 'exercise_to_training_id'))) {
      await queryInterface.addColumn('repstotrainings', 'exercise_to_training_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'exercisestotrainings', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
    }

    await queryInterface.sequelize.query(`
      UPDATE repstotrainings AS r
      SET exercise_to_training_id = ett.id
      FROM exercisestotrainings AS ett
      WHERE ett.training_id = r.training_id
        AND ett.exercise_id = r.exercise_id
        AND r.exercise_to_training_id IS NULL;
    `);

    await queryInterface.sequelize.query(`
      DELETE FROM repstotrainings AS r
      USING (
        SELECT exercise_to_training_id, MAX(id) AS keep_id
        FROM repstotrainings
        WHERE exercise_to_training_id IS NOT NULL
        GROUP BY exercise_to_training_id
        HAVING COUNT(*) > 1
      ) AS dups
      WHERE r.exercise_to_training_id = dups.exercise_to_training_id
        AND r.id <> dups.keep_id;
    `);

    if (await indexExists(queryInterface, 'repstotrainings_exercise_training_idx')) {
      await queryInterface.removeIndex('repstotrainings', 'repstotrainings_exercise_training_idx');
    }

    if (!(await indexExists(queryInterface, 'repstotrainings_exercise_to_training_id_uq'))) {
      await queryInterface.addIndex('repstotrainings', ['exercise_to_training_id'], {
        name: 'repstotrainings_exercise_to_training_id_uq',
        unique: true,
      });
    }

    if (!(await columnExists(queryInterface, 'repstoexercises', 'exercise_to_training_id'))) {
      await queryInterface.addColumn('repstoexercises', 'exercise_to_training_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'exercisestotrainings', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
    }

    await queryInterface.sequelize.query(`
      UPDATE repstoexercises AS r
      SET exercise_to_training_id = ett.id
      FROM exercisestotrainings AS ett
      WHERE ett.training_id = r.training_id
        AND ett.exercise_id = r.exercise_id
        AND r.exercise_to_training_id IS NULL;
    `);

    await queryInterface.sequelize.query(`
      DELETE FROM repstoexercises AS r
      USING (
        SELECT exercise_to_training_id, student_id, MAX(id) AS keep_id
        FROM repstoexercises
        WHERE exercise_to_training_id IS NOT NULL
        GROUP BY exercise_to_training_id, student_id
        HAVING COUNT(*) > 1
      ) AS dups
      WHERE r.exercise_to_training_id = dups.exercise_to_training_id
        AND r.student_id = dups.student_id
        AND r.id <> dups.keep_id;
    `);

    if (await indexExists(queryInterface, 'repstoexercises_exercise_training_student_idx')) {
      await queryInterface.removeIndex(
        'repstoexercises',
        'repstoexercises_exercise_training_student_idx'
      );
    }

    if (!(await indexExists(queryInterface, 'repstoexercises_link_student_uq'))) {
      await queryInterface.addIndex(
        'repstoexercises',
        ['exercise_to_training_id', 'student_id'],
        {
          name: 'repstoexercises_link_student_uq',
          unique: true,
        }
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('repstoexercises', 'repstoexercises_link_student_uq');
    await queryInterface.addIndex(
      'repstoexercises',
      ['exercise_id', 'training_id', 'student_id'],
      {
        name: 'repstoexercises_exercise_training_student_idx',
        unique: true,
      }
    );
    await queryInterface.removeColumn('repstoexercises', 'exercise_to_training_id');

    await queryInterface.removeIndex('repstotrainings', 'repstotrainings_exercise_to_training_id_uq');
    await queryInterface.addIndex('repstotrainings', ['exercise_id', 'training_id'], {
      name: 'repstotrainings_exercise_training_idx',
    });
    await queryInterface.removeColumn('repstotrainings', 'exercise_to_training_id');

    await queryInterface.removeIndex(
      'exercisestotrainings',
      'exercisestotrainings_training_sort_idx'
    );
    await queryInterface.addIndex('exercisestotrainings', ['training_id', 'exercise_id'], {
      unique: true,
      name: 'uq_exercisestotrainings_training_exercise',
    });
    await queryInterface.removeColumn('exercisestotrainings', 'sort_order');
  },
};