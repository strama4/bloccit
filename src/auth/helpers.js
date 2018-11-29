const bcrypt = require('bcryptjs');

module.exports = {
    ensureAuthenticated(req, res, next) { // route handler to authenticate user. Says that if there is no user included in the request object
        if (!req.user) {                  // redirect the user to the sign_in route. Otherwise, continue to the next function (usually the 
            req.flash('notice', 'You must be signed in to do that.') // controller)
            return res.redirect('/users/sign_in');
        } else {
            return next();
        }
    },
    comparePass(userPassword, databasePassword) {
        return bcrypt.compareSync(userPassword, databasePassword);
    }
}