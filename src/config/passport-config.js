const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../db/models').User;
const authHelper = require('../auth/helpers');

module.exports = {
    init(app) {
        app.use(passport.initialize()); // initializes passport within the app
        app.use(passport.session()); // tells the app to use a session to store user information

        passport.use(new LocalStrategy({  // use the LocalStrategy option to deal with authorization, everything until line 23 are parameters passed into LocalStrategy
            usernameField: 'email'  // we're saying that the user field is acutally called email in our table
        }, (email, password, done) => { // 
            User.findOne({
                where: { email } // ie. {'email': email}
            })
            .then((user) => {
                if (!user || !authHelper.comparePass(password, user.password)) { // if the user is undefined or the password passed in doesn't match
                    return done(null, false, { message: 'Invalid email or password'})
                }
                return done(null, user); // return 'null' for error message, 'user' for the user that signed in
            })
        }));

        passport.serializeUser((user, callback) => {
            callback(null, user.id);
        });

        passport.deserializeUser((id, callback) => {
            User.findById(id)
            .then((user) => {
                callback(null, user);
            })
            .catch((err) => {
                callback(err, user);
            });
        });
    }
}