'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn(
      'Users', 
      'role', 
      {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'member'
      }
    )
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('Users', 'role');
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
