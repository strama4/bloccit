const voteQueries = require('../db/queries.votes');

module.exports = {
    upVote(req, res, next) {
        if (req.user) {
            voteQueries.createVote(req, 1, (err, vote) => {
                if (err) {
                    req.flash('error', err);
                }
                res.redirect(req.headers.referer);
            });
        } else {
            req.flash('notice', 'You must be signed in to do that');
            res.redirect(req.headers.referer);
        }
    },
    downVote(req, res, next) {
        if (req.user) {
            voteQueries.createVote(req, -1, (err, vote) => {
                if (err) {
                    req.flash('error', err);
                }
                res.redirect(req.headers.referer);
            });
        } else {
            req.flash('notice', 'You must be signed in to do that');
            res.redirect(req.headers.referer);
        }
    }    
}