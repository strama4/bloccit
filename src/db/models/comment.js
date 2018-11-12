'use strict';
module.exports = (sequelize, DataTypes) => {
  var Comment = sequelize.define('Comment', {
    body: {
      type: DataTypes.STRING,
      allowNull: false
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {});
  Comment.associate = function(models) {
    // associations can be defined here
    Comment.belongsTo(models.Post, {
      foreignKey: 'postId',
      onDelete: 'CASCADE'
    });

    Comment.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    })
  
    Comment.addScope('lastFiveFor', (userId) => {
    return { // Included Post to be able to connect to the post after
      include: [{   
        model: models.Post
      }],
      where: { userId },
      limit: 5,
      order: [["createdAt", "DESC"]]
    }
  });
};

  return Comment;
};