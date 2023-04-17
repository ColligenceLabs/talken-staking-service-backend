'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('rewards', 'increase', {
      type: Sequelize.STRING,
    });
  },
};
