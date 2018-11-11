const favoriteQueries = require('../db/queries.favorites');

module.exports = {
    create(req, res, index) {
        if (req.user) {
            favoriteQueries.createFavorite(req, (err, favorite) => {
                if (err) {
                    req.flash('error', err);
                }
            });
        } else {
            req.flash('notice', 'You have to be signed in to do that.');
        }
        res.redirect(req.headers.referer);
    },
    destroy(req, res, index) {
        if (req.user) {
            favoriteQueries.deleteFavorite(req, (err, favorite) => {
                if (err) {
                    req.flash('error', err);
                }
            })
        } else {
            req.flash('notice', 'You have to be signed in to do that.');
        }
        res.redirect(req.headers.referer);
    }
}