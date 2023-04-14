'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.createTable("rewards", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        type: Sequelize.STRING,
      },
      change: {
        type: Sequelize.INTEGER,
      },
      change_usd: {
        type: Sequelize.INTEGER,
      },
      apr: {
        type: Sequelize.JSON,
      },
      balance: {
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      }
    })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.dropTable("rewards")
  }
};
