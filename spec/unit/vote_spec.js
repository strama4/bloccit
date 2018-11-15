const sequelize = require('../../src/db/models/index').sequelize;
const User = require('../../src/db/models').User;
const Topic = require('../../src/db/models').Topic;
const Comment = require('../../src/db/models').Comment;
const Post = require('../../src/db/models').Post;
const Vote = require('../../src/db/models').Vote;

describe('Vote', () => {
    beforeEach((done) => {
        this.user;
        this.topic;
        this.post;
        this.comment;
        sequelize.sync({ force: true }).then(() => {
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
                        body: 'I saw some rocks.',
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

                    Comment.create({
                        body: 'ay caramba!!!!',
                        userId: this.user.id,
                        postId: this.post.id
                    })
                    .then((comment) => {
                        this.comment = comment;
                        done();
                    });
                });
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });
    });

    // tests
    describe('#create()', () => {
        it('should create an upvote with a 1 value and associated user/post', (done) => {
            Vote.create({
                value: 1,
                userId: this.user.id,
                postId: this.post.id 
            })
            .then((vote) => {
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
        it('should create a downvote with a -1 value and associated user/post', (done) => {
            Vote.create({
                value: -1,
                userId: this.user.id,
                postId: this.post.id 
            })
            .then((vote) => {
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
        it('should not create a vote without a user or post associated', (done) => {
            Vote.create({
                value: 1
            })
            .then((vote) => {
                done();
            })
            .catch((err) => {
                expect(err.message).toContain('Vote.userId cannot be null');
                expect(err.message).toContain('Vote.postId cannot be null');
                done();
            });
        });
    });

    describe('#setUser()', () => {
        it('should set a user to a vote', (done) => {
            Vote.create({
                value: 1,
                userId: this.user.id,
                postId: this.post.id 
            })
            .then((vote) => {
                // this.vote = vote;
                expect(vote.userId).toBe(this.user.id);
                User.create({
                    email: 'bob@example.com',
                    password: 'password'
                })
                .then((newUser) => {
                    vote.setUser(newUser)
                    .then((vote) => {
                        expect(vote.userId).toBe(newUser.id);
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });
    });

    describe('#getUser()', () => {
        it('should return the associated user with the vote', (done) => {
            Vote.create({
                value: -1,
                userId: this.user.id,
                postId: this.post.id
            })
            .then((vote) => {
                vote.getUser()
                .then((user) => {
                    expect(user.email).toBe('starman@tesla.com');
                    done();
                })
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        })
    });

    describe('#setPost()', () => {
        it('should associate a vote with the post', (done) => {
            Vote.create({
                value: 1,
                userId: this.user.id,
                postId: this.post.id
            })
            .then((vote) => {
                this.vote = vote;
                Post.create({
                    title: 'Dress code on Proxima b',
                    body: 'Spacesuit, space helmet, space boots, and space gloves',
                    userId: this.user.id,
                    topicId: this.topic.id 
                })
                .then((newPost) => {
                    expect(this.vote.postId).toBe(this.post.id);
                    this.vote.setPost(newPost)
                    .then((vote) => {
                        expect(vote.postId).toBe(newPost.id);
                        done();
                    })
                })
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });
    });

    describe('#getPost()', () => {
        it('should return the post associated with the vote', (done) => {
            Vote.create({
                value: 1, 
                userId: this.user.id,
                postId: this.post.id   
            })
            .then((vote) => {
                vote.getPost()
                .then((associatedPost) => {
                    expect(associatedPost.title).toBe('First visit to Proxima Centauri b');
                    done();
                });
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });
    });
});