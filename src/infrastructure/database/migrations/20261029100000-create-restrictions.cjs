'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('restrictions', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      author_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      author_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      restriction_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      target_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      target_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      post_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'posts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      comment_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'comments', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      content_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('restrictions', ['author_id', 'author_type', 'created_at'], {
      name: 'restrictions_author_created_at_idx',
    });
    await queryInterface.addIndex('restrictions', ['author_id', 'author_type', 'restriction_type'], {
      name: 'restrictions_author_type_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('restrictions');
  },
};
