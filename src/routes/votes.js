const express = require('express');
const router = express.Router();
const helper = require('../auth/helpers');

const voteController = require('../controllers/voteController');

router.get('/topics/:topicId/posts/:postId/votes/upvote',
    helper.ensureAuthenticated,
    voteController.upVote);
router.get('/topics/:topicID/posts/:postId/votes/downvote', 
    helper.ensureAuthenticated,
    voteController.downVote);

module.exports = router;