const express = require('express');
const router = express.Router();

const voteController = require('../controllers/voteController');

router.get('/topics/:topicId/posts/:postId/votes/upvote', 
    voteController.upVote);
router.get('/topics/:topicID/posts/:postId/votes/downvote', 
    voteController.downVote);

module.exports = router;