const bcrypt = require('bcryptjs');
const User = require('./models').User;

module.exports = {
    createUser(newUser, callback) {
        const salt = bcrypt.genSaltSync();
        const hashedPassword = bcrypt.hashSync(newUser.password, salt);
        return User.create({
            email: newUser.email,
            password: hashedPassword
        })
        .then((user) => {
            callback(null, user);
        })
        .catch((err) => {
            callback(err);
        })
    },
    getUser(id, callback) {
        User.findById(id)
        .then((user) => {
            callback(null, user);
        })
        .catch((err) => {
            callback(err);
        })
    }
}