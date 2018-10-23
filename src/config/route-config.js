module.exports = {
    init(app) {
        const staticRoutes = require("../routes/static").default;
        app.use(staticRoutes);
    }
}