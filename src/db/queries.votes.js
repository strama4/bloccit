const Vote = require('./models').Vote;
const Post = require('./models').Post;
const User = require('./models').User;
const Comment = require('./models').Comment;

module.exports = {
    createVote(req, value, callback) {
        return Vote.findOne({
            where: {
                postId: req.params.postId,
                userId: req.user.id
            }
        })
        .then((vote) => {
            if (vote) {
                vote.value = value;
                vote.save()
                .then((vote) => {
                    callback(null, vote);
                })
                .catch((err) => {
                    callback(err);
                });
            } else {
                const newVote = {
                    value,
                    userId: req.user.id,
                    postId: req.params.postId
                }
                Vote.create(newVote)
                .then((vote) => {
                    callback(null, vote);
                })
                .catch((err) => {
                    callback(err);
                }); 
            }
        });
    }
}