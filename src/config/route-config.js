module.exports = {
    init(app) {
        const staticRoutes = require("../routes/static");
        const topicRoutes = require("../routes/topics");
        const postRoutes = require('../routes/posts');
        const userRouters = require('../routes/users');
        const commentRouters = require('../routes/comments');
        const voteRoutes = require('../routes/votes');

        if (process.env.NODE_ENV === 'test') {
            const mockAuth = require('../../spec/support/mock-auth.js');
            mockAuth.fakeIt(app);
        }
        app.use(staticRoutes);
        app.use(topicRoutes);
        app.use(postRoutes);
        app.use(userRouters);
        app.use(commentRouters);
        app.use(voteRoutes);
    }
}