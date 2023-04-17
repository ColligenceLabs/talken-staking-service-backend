'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.createTable("rewards", {
      wallet: {
        type: Sequelize.STRING,
      },
      shares: {
        type: Sequelize.STRING,
      },
      total_shares: {
        type: Sequelize.STRING,
      },
      amount: {
        type: Sequelize.STRING,
      },
      tx_hash: {
        type: Sequelize.STRING,
      },
      block_number: {
        type: Sequelize.BIGINT,
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
