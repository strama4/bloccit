'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Posts', // adding a column to the 'Posts' table
      'userId', // column will be called 'userId'
      {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE', // delete the posts when the userId is deleted
        allowNull: false, // posts without a user will not exist
        references: {
          model: 'Users', // pull the userId from the 'Users' table
          key: 'id', // in the 'Users' table, the key is 'id'
          as: 'userId' // it'll be stored here as 'userId'
        }
      }
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Posts', 'userId');
  }
};
