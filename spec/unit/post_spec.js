const sequelize = require('../../src/db/models/index').sequelize;
const Topic = require('../../src/db/models').Topic;
const Post = require('../../src/db/models').Post;
const User = require('../../src/db/models').User;
const Vote = require('../../src/db/models').Vote;

describe('Post', () => {
    beforeEach((done) => {
        this.topic;
        this.post;
        this.user;

        sequelize.sync({ force: true }).then((res) => {

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
                        title: 'My first visit to Proxima Centauri b',
                        body: 'I saw some rocks',
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
                    this.post = topic.posts[0];
                    done();
                }) 
            });
        });
    });
    describe('#create()', () => {
        it('should create a post object with a title, body, and assigned topic and user', (done) => {
            const newPost = {
                title: 'Pros of Cryosleep during the long journey',
                body: '1. Not having to answer the \'are we there yet?\' question',
                topicId: this.topic.id,
                userId: this.user.id 
            }
            Post.create(newPost)
            .then((post) => {
                expect(post.title).toBe('Pros of Cryosleep during the long journey');
                expect(post.body).toBe('1. Not having to answer the \'are we there yet?\' question');
                expect(post.userId).toBe(this.user.id);
                done();
            })
            .catch((err) => {
                console.log(err);                
                done();
            });
        });
        it('should not create a post with missing title, body or assigned topic', (done) => {
            Post.create({
                title: 'Pros of Cryosleep during the long journey'
            })
            .then((post) => {
                done();
            })
            .catch((err) => {
                expect(err.message).toContain('Post.body cannot be null');
                expect(err.message).toContain('Post.topicId cannot be null');
                done();
            });
        });
    });
    describe('#setTopic()', () => {
        it('should associate a topic and a post together', (done) => {
            Topic.create({
                title: 'Challenges of interstellar travel',
                description: '1. The Wi-Fi is terrible'
            })
            .then((newTopic) => {
                expect(this.post.topicId).toBe(this.topic.id); // confirming that newTopic didn't hijack post.id
                this.post.setTopic(newTopic)
                .then((post) => {
                    expect(post.topicId).toBe(newTopic.id); // confirm it did switch over to newTopic
                    done();
                });
            });
        });
    });
    describe('#getTopic()', () => {
        it('should return the associated topic', (done) => {
            this.post.getTopic()
            .then((associatedTopic) => {
                expect(associatedTopic.title).toBe('Expeditions to Alpha Centauri');
                done();
            })
        });
    });
    describe('#setUser()', () => {
        it('should associate a post and a user together', (done) => {
            User.create({
                email: 'ada@example.com',
                password: 'password'
            })
            .then((newUser) => {
                expect(this.post.userId).toBe(this.user.id);
                this.post.setUser(newUser)
                .then((post) => {
                    expect(this.post.userId).toBe(newUser.id);
                    done();
                });
            });
        });
    });
    describe('#getUser()', () => {
        it('should return the user of the post', (done) => {
            this.post.getUser()
            .then((associatedUser) => {
                expect(associatedUser.email).toBe('starman@tesla.com');
                done();
            });
        });
    });
    describe('#getPoints()', () => {
        it('should return the correct value of points for a post', (done) => {
            Vote.create({
                value: 1,
                userId: this.user.id,
                postId: this.post.id
            })
            .then((vote) => {
                Post.findById(this.post.id, {
                    include: [{model: Vote, as: 'votes'}]
                })
                .then((post) => {
                    expect(post.getPoints()).toBe(1);
                    User.create({
                        email: 'papajohn@gmail.com',
                        password: 'pizza'
                    })
                    .then((user) => {
                        Vote.create({
                            value: 1, 
                            userId: user.id,
                            postId: this.post.id
                        })
                        .then((vote) => {
                            Post.findById(this.post.id, {
                                include: [{model: Vote, as: 'votes'}]
                            })
                            .then((post) => {
                                expect(post.getPoints()).toBe(2);
                                done();
                            })
                            .catch((err) => {
                                console.log(err);
                                done();
                            });
                        })
                    })
                })
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });
    });
    describe('#hasUpvoteFor()', () => {
        it('should return false if the user has not voted on a post', (done) => {
            Post.findById(this.post.id, {
                include: [{model: Vote, as: 'votes'}]
            })
            .then((post) => {
                expect(post.hasUpvoteFor(this.user.id)).not.toBeTruthy();
                done();
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });
        it('should return true if the user has upvoted a post', (done) => {
            Vote.create({
                value: 1,
                userId: this.user.id,
                postId: this.post.id
            })
            .then((vote) => {
                Post.findById(this.post.id, {
                    include: [{model: Vote, as: 'votes'}]
                })
                .then((post) => {
                    expect(post.hasUpvoteFor(this.user.id)).toBeTruthy();
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });
        });
    });
    describe('#hasDownvoteFor()', () => {
        it('should return false if the user has upvoted a post', (done) => {
            Vote.create({
                value: 1,
                userId: this.user.id,
                postId: this.post.id
            })
            .then((vote) => {
                Post.findById(this.post.id, {
                    include: [{model: Vote, as: 'votes'}]
                })
                .then((post) => {
                    expect(post.hasDownvoteFor(this.user.id)).not.toBeTruthy();
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });
        });
        it('should return true if the user has downvoted a post', (done) => {
            Vote.create({
                value: -1,
                userId: this.user.id,
                postId: this.post.id 
            })
            .then((vote) => {
                Post.findById(this.post.id, {
                    include: [{model: Vote, as: 'votes'}]
                })
                .then((post) => {
                    expect(post.hasDownvoteFor(this.user.id)).toBeTruthy();
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });
        })
    });
});

// this.votes returns [ {dataValues: {id: 1, value: 1, userId: 1}}, 
//                      {dataValues: {id: 1, value: 1, userId: 2}} ]