'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('anamnesisexclusive', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'students', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      full_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      adress: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      birth: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      city_country: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      profession: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      whatsapp: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      instagram: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      indication: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      link_medical_request: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      weight: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      heigth: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      waist: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      abdomen: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      hip: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      photos_posture: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      photos_up_leg: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      photos_up_arms: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      photos_up_leg_dois: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      photos_sit: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      have_a_children: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      objective: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      nutritional_monitoring: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      link_food_planning: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      biggest_challenge: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      already_training: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      weekly_training_quantity: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      time_training: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      pain: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      link_current_workout: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      level_trianing: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      link_woman_inspiration: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      size_shirt: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      size_leggin: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      size_top: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      number_shoe: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('anamnesisexclusive', ['student_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('anamnesisexclusive');
  },
};
