'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('rewards', 'increase', {
      type: Sequelize.STRING,
    });
  },
  async down (queryInterface, Sequelize) {
    return queryInterface.removeColumn("rewards", 'increase');
  }
};
