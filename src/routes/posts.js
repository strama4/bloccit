const express = require('express');
const router = express.Router();
const helper = require('../auth/helpers');

const postController = require('../controllers/postController');
const validation = require('./validation');

router.get('/topics/:topicId/posts/new', postController.new);
router.post('/topics/:topicId/posts/create', 
    helper.ensureAuthenticated, 
    validation.validatePosts, 
    postController.create);
router.get('/topics/:topicId/posts/:id', postController.show); // :topicId is available via req.params.topicId, :id is avaiable via req.params.id
router.post('/topics/:topicId/posts/:id/destroy', postController.destroy);
router.get('/topics/:topicId/posts/:id/edit', postController.edit);
router.post('/topics/:topicId/posts/:id/update', validation.validatePosts, postController.update);

module.exports = router;