'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('likes', ['post_id', 'author_id', 'author_type'], {
      unique: true,
      name: 'likes_post_id_author_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('likes', 'likes_post_id_author_unique');
  },
};
