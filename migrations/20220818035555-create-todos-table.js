'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.createTable('todos', { 
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
      },
      activity_group_id: {
        type: Sequelize.INTEGER.UNSIGNED,
      },
      is_activity: {
        type: Sequelize.TINYINT.UNSIGNED,
      },
      priority: {
        type: Sequelize.ENUM('very-high','high','normal','low','very-low'),
        defaultValue: 'very-high'
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('todos');
  }
};
