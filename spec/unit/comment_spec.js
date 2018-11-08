const sequelize = require('../../src/db/models/index').sequelize;
const Post = require('../../src/db/models').Post;
const Topic = require('../../src/db/models').Topic;
const Comment = require('../../src/db/models').Comment;
const User = require('../../src/db/models').User;

describe('Comments', () => {
    beforeEach((done) => {
        this.topic;
        this.user;
        this.post;
        this.comment;

        sequelize.sync({force: true}).then(() => {
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
                        userId: this.user.id,
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
                
                Comment.create({
                    body: 'ay caramba!!!!',
                    userId: this.user.id,
                    postId: this.post.id
                })
                .then((comment) => {
                    this.comment = comment;
                    done();
                })
                .catch((err) => {
                    console.log(err);
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

    describe('#create()', () => {
        it('should create a new comment object with a body, assigned post and user', (done) => {
            Comment.create({
                body: 'The geological kind.',
                userId: this.user.id,
                postId: this.post.id
            })
            .then((comment) => {
                expect(comment.body).toBe('The geological kind.');
                expect(comment.userId).toBe(this.user.id);
                expect(comment.postId).toBe(this.post.id);
                done();
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });
        it('should not create a comment object with missign body, assigned post or user', (done) => {
            Comment.create({
                body: 'Are the inertial dampers still engaged?'
            })
            .then((comment) => {
                done();
            })
            .catch((err) => {
                expect(err.message).toContain('Comment.userId cannot be null');
                expect(err.message).toContain('Comment.postId cannot be null');
                done();
            });
        });
    });

    describe('#setUser()', () => {
        it('should assign a specific userId to the comment', (done) => {
            User.create({
                email: 'bob@example.com',
                password: '123456'
            })
            .then((newUser) => {
                expect(this.comment.userId).toBe(this.user.id);
                this.comment.setUser(newUser)
                .then((comment) => {
                    expect(comment.userId).toBe(newUser.id);
                    done();
                });
            });
        });
    });
    
    describe('#getUser()', () => {
        it('should get the associated user', (done) => {
            this.comment.getUser()
            .then((user) => {
                expect(user.email).toBe('starman@tesla.com');
                done();
            });
        });
    });

    describe('#setPost()', () => {
        it('should associate a post and a comment together', (done) => {
            Post.create({
                title: 'Dress code on Proxima b',
                body: 'Space helmet, space boots, space gloves, space suit',
                userId: this.user.id,
                topicId: this.topic.id
            })
            .then((newPost) => {
                expect(this.comment.postId).toBe(this.post.id);
                this.comment.setPost(newPost)
                .then((comment) => {
                    expect(comment.postId).toBe(newPost.id);
                    done();
                });
            });
        });
    });

    describe('#getPost()', () => {
        it('should return the post associated', (done) => {
            this.comment.getPost()
            .then((associatedPost) => {
                expect(associatedPost.title).toBe('My first visit to Proxima Centauri b');
                done();
            });
        });
    });
});