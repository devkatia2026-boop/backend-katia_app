'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subjectwells', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      well_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'wells', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      midia: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('subjectwells', ['well_id', 'created_at'], {
      name: 'subjectwells_well_created_at_idx',
    });

    const table = await queryInterface.describeTable('wells');
    const wells = await queryInterface.sequelize.query(
      'SELECT id, photo, video_link, pdf FROM wells',
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const row of wells) {
      const now = new Date();
      const inserts = [];

      if (row.photo && String(row.photo).trim()) {
        inserts.push({
          well_id: row.id,
          midia: String(row.photo).trim(),
          type: 'foto',
          created_at: now,
        });
      }

      if (row.video_link && String(row.video_link).trim()) {
        inserts.push({
          well_id: row.id,
          midia: String(row.video_link).trim(),
          type: 'video_link',
          created_at: now,
        });
      }

      if (row.pdf && String(row.pdf).trim()) {
        inserts.push({
          well_id: row.id,
          midia: String(row.pdf).trim(),
          type: 'pdf',
          created_at: now,
        });
      }

      if (inserts.length > 0) {
        await queryInterface.bulkInsert('subjectwells', inserts);
      }
    }

    if (table.photo) {
      await queryInterface.removeColumn('wells', 'photo');
    }

    if (table.video_link) {
      await queryInterface.removeColumn('wells', 'video_link');
    }

    if (table.pdf) {
      await queryInterface.removeColumn('wells', 'pdf');
    }

    if (table.tittle && table.tittle.type !== 'TEXT' && table.tittle.type !== 'text') {
      await queryInterface.changeColumn('wells', 'tittle', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('wells');

    if (!table.photo) {
      await queryInterface.addColumn('wells', 'photo', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }

    if (!table.video_link) {
      await queryInterface.addColumn('wells', 'video_link', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }

    if (!table.pdf) {
      await queryInterface.addColumn('wells', 'pdf', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }

    const subjects = await queryInterface.sequelize.query(
      'SELECT well_id, midia, type FROM subjectwells ORDER BY id ASC',
      { type: Sequelize.QueryTypes.SELECT }
    );

  const byWell = new Map();

    for (const row of subjects) {
      const bucket = byWell.get(row.well_id) ?? { photo: null, video_link: null, pdf: null };

      if (row.type === 'foto' && !bucket.photo) {
        bucket.photo = row.midia;
      } else if (row.type === 'video_link' && !bucket.video_link) {
        bucket.video_link = row.midia;
      } else if (row.type === 'pdf' && !bucket.pdf) {
        bucket.pdf = row.midia;
      } else if (row.type === 'video' && !bucket.video_link) {
        bucket.video_link = row.midia;
      }

      byWell.set(row.well_id, bucket);
    }

    for (const [wellId, media] of byWell.entries()) {
      await queryInterface.sequelize.query(
        'UPDATE wells SET photo = :photo, video_link = :video_link, pdf = :pdf WHERE id = :wellId',
        {
          replacements: {
            wellId,
            photo: media.photo,
            video_link: media.video_link,
            pdf: media.pdf,
          },
        }
      );
    }

    await queryInterface.dropTable('subjectwells');
  },
};