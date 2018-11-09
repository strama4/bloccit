const request = require('request');
const server = require('../../src/server');
const base = 'http://localhost:3000/topics/';

const sequelize = require('../../src/db/models/index').sequelize;
const Topic = require('../../src/db/models').Topic;
const Post = require('../../src/db/models').Post;
const User = require('../../src/db/models').User;
const Vote = require('../../src/db/models').Vote;

describe('routes : votes', () => {
    beforeEach((done) => {
        this.user;
        this.topic;
        this.post;
        this.vote;
        sequelize.sync({force:true}).then(() => {
            User.create({
                email: 'starman@tesla.com',
                password: 'Trekkie4lyfe'
            })
            .then((user) => {
                this.user = user;

                Topic.create({
                    title: 'Expeditions to Alpha Centauri',
                    description: 'A compilation of reports from recent visits to the star system.',
                    posts: [{
                        title: 'First visit to Proxima Centauri b',
                        body: 'I saw lots of rocks.',
                        userId: this.user.id
                    }]
                }, {
                    include: {
                        model: Post,
                        as: 'posts'
                    }
                })
                .then((topic) => {
                    this.topic = topic;
                    this.post = this.topic.posts[0];
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });
        });
    });

    // guest context 
    describe('Guest attempting to vote on a post', () => {
        beforeEach((done) => {
            request.get({
                url: 'http://localhost:3000/auth/fake',
                form: {
                    userId: 0
                }
            }, (err, res, body) => {
                done();
            });
        });

        describe('GET /topics/:topicId/posts/:postId/vote/upvote', () => {
            it('should not be able to add a vote', (done) => {
                const options = {
                    url: `${base}${this.topic.id}/posts/${this.post.id}/votes/upvote`
                };
                request.get(options, (err, res, body) => {
                    Vote.findOne({
                        where: {
                            userId: this.user.id,
                            postId: this.post.id
                        }
                    })
                    .then((vote) => {
                        expect(vote).toBeNull();
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
        });
    });

    // member context
    describe('Member attempting to vote on a post', () => {
        beforeEach((done) => {
            request.get({
                url: 'http://localhost:3000/auth/fake',
                form: {
                    role: 'member',
                    userId: this.user.id
                } 
            }, (err, res, body) => {
                done();
            });
        });
        describe('GET /topics/:topicId/posts/:postId/votes/upvote', () => {
            it('should associate an upvote with the user/post and be a value of 1', (done) => {
                request.get(`${base}${this.topic.id}/posts/${this.post.id}/votes/upvote`,
                (err, res, body) => {
                    Vote.findOne({
                        where: {
                            userId: this.user.id,
                            postId: this.post.id
                        }
                    })
                    .then((vote) => {
                        expect(vote).not.toBeNull();
                        expect(vote.value).toBe(1);
                        expect(vote.userId).toBe(this.user.id);
                        expect(vote.postId).toBe(this.post.id);
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
        });
        describe('GET /topics/:topicId/posts/:postId/votes/downvote', () => {
            it('should associate a downvote with the user/post and be a value of -1', (done) => {
                request.get(`${base}${this.topic.id}/posts/${this.post.id}/votes/downvote`,
                (err, res, body) => {
                    Vote.findOne({
                        where: {
                            userId: this.user.id,
                            postId: this.post.id
                        }
                    })
                    .then((vote) => {
                        expect(vote).not.toBeNull();
                        expect(vote.value).toBe(-1);
                        expect(vote.userId).toBe(this.user.id);
                        expect(vote.postId).toBe(this.post.id);
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
        });
    });
});