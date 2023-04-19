'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('histories', 'totalstake', {
      type: Sequelize.STRING,
    });
  },
  async down (queryInterface, Sequelize) {
    return queryInterface.removeColumn("histories", 'totalstake');
  }
};
