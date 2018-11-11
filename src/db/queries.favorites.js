const Favorite = require('./models').Favorite;
const Comment = require('./models').Comment;
const Post = require('./models').Post;
const User = require('./models').User;

const Authorizer = require('../policies/favorite');

module.exports = {
    createFavorite(req, callback) {
        return Favorite.create({
            userId: req.user.id,
            postId: req.params.postId
        })
        .then((favorite) => {
            callback(null, favorite);
        })
        .catch((err) => {
            callback(err);
        });
    },
    deleteFavorite(req, callback) {
        const id = req.params.id;

        return Favorite.findById(id)
        .then((favorite) => {
            if (!favorite) {
                callback('Favorite not found');
            } 
            const authorized = new Authorizer(req.user, favorite).destroy();

            if (authorized) {
                Favorite.destroy({where: { id }})
                .then((result) => {
                    callback(null, result);
                })
                .catch((err) => {
                    callback(err);
                });
            } else {
                req.flash('notice', 'You are not authorized to do that.');
                callback(401);
            }
            
        })
        .catch((err) => {
            callback(err);
        });
    }
}