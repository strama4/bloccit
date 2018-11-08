const request = require('request');
const server = require('../../src/server');
const base = 'http://localhost:3000/topics/';

const sequelize = require('../../src/db/models/index').sequelize;
const Comment = require('../../src/db/models').Comment;
const Topic = require('../../src/db/models').Topic;
const User = require('../../src/db/models').User;
const Post = require('../../src/db/models').Post;

describe('routes : comments', () => {
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
                        title: 'My first visit to Proxima Centauri b',
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
                        body: 'ay caramba!!!',
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
                    })
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });
        });
    });

    // Guest context
    describe('Guests using CRUD operations for Comments', () => {
        beforeEach((done) => {
            const options = {
                url: 'http://localhost:3000/auth/fake',
                form: {
                    userId: 0
                }
            }
            request.get(options, (err, res, body) => {
                done();
            })
        })
        describe('POST /topics/:topicId/posts/:postId/comments/create', () => {
            it('should not create a new comment', (done) => {
                const options = {
                    url: `${base}${this.topic.id}/posts/${this.post.id}/comments/create`,
                    form: {
                        body: 'This comment is amazing'
                    }
                };
                request.post(options, (err, res, body) => {
                    Comment.findOne({where: {body: 'This comment is amazing'}})
                    .then((comment) => {
                        expect(comment).toBeNull();
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
        });
        describe('POST /topics/:topicId/posts/:postId/comments/:id/destroy', () => {
            it('should not delete the comment with the associated ID', (done) => {
                Comment.all()
                .then((comments) => {
                    const commentCountBeforeDelete = comments.length;
                    expect(commentCountBeforeDelete).toBe(1);
                    request.post(`${base}${this.topic.id}/posts/${this.post.id}/comments/${this.comment.id}/destroy`, 
                    (err, res, body) => {
                        Comment.all()
                        .then((comments) => {
                            expect(err).toBeNull();
                            expect(comments.length).toBe(commentCountBeforeDelete);
                            done();
                        });
                    });
                })
                
            });
        });
    });

    // member context
    describe('a member using CRUD operations on comments', () => {
        beforeEach((done) => {
            const options = {
                url: 'http://localhost:3000/auth/fake',
                form: {
                    role: 'member',
                    userId: this.user.id 
                }
            }
            request.get(options, (err, res, body) => {
                done();
            });
        });
        describe('POST /topics/:topicId/posts/:postId/comments/create', () => {
            it('should create a new comment and redirect', (done) => {
                const options = {
                    url: `${base}${this.topic.id}/posts/${this.post.id}/comments/create`,
                    form: {
                        body: 'This comment is amazing!',
                    }
                }
                request.post(options, (err, res, body) => {
                    Comment.findOne({where: {body: 'This comment is amazing!'}})
                    .then((comment) => {
                        expect(comment).not.toBeNull();
                        expect(comment.userId).toBe(this.user.id);
                        expect(comment.body).toBe('This comment is amazing!');
                        expect(comment.id).not.toBeNull();
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
        });
        describe('POST /topics/:topicId/posts/:postId/comments/:id/destroy', () => {
            it('should delete the comment with the associated ID', (done) => {
                Comment.all()
                .then((comments) => {
                    const commentCountBeforeDelete = comments.length;
                    expect(commentCountBeforeDelete).toBe(1);
                    request.post(`${base}${this.topic.id}/posts/${this.post.id}/comments/${this.comment.id}/destroy`,
                        (err, res, body) => {
                            expect(res.statusCode).toBe(302);
                            Comment.all()
                            .then((comments) => {
                                expect(err).toBeNull();
                                expect(comments.length).toBe(commentCountBeforeDelete - 1);
                                done();
                            })
                            .catch((err) => {
                                console.log(err);
                                done();
                            });    
                        }
                    );
                });
            });
            it('should not delete the comment if not the user', (done) => {
                User.create({
                    email: 'bob@gmail.com',
                    password: 'bobisthebest'
                })
                .then((user) => {
                    request.get({
                        url: 'http://localhost:3000/auth/fake',
                        form: {
                            role: 'member',
                            userId: user.id
                        }
                    }, (err, body, res) => {
                        Comment.all()
                        .then((comments) => {
                            const commentCountBeforeDelete = comments.length;
                            expect(commentCountBeforeDelete).toBe(1);
                            request.post(`${base}${this.topic.id}/posts/${this.post.id}/comments/${this.comment.id}/destroy`,
                            (err, res, body) => {
                                Comment.all()
                                .then((comments) => {
                                    expect(comments.length).toBe(commentCountBeforeDelete);
                                    done();
                                })
                                .catch((err) => {
                                    console.log(err);
                                    done();
                                });
                            })
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

    // admin context
    describe('admin using CRUD operations on Comment', () => {
        beforeEach((done) => {
            User.create({
                email: 'daboss@admin.com',
                password: 'beingabossisboss'
            })
            .then((user) => {
                request.get({
                    url: 'http://localhost:3000/auth/fake',
                    form: {
                        userId: user.id,
                        role: 'admin',
                        email: user.email
                    }
                }, (err, res, body) => {
                    done();
                })
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });
        describe('POST /topics/:topicId/posts/:postId/comments/:id/destroy', () => {
            it('should delete a comment that was not created by the admin', (done) => {
                Comment.all()
                .then((comments) => {
                    const commentCountBeforeDelete = comments.length;
                    request.post(`${base}${this.topic.id}/posts/${this.post.id}/comments/${this.comment.id}/destroy`, 
                        (err, res, body) => {
                            expect(res.statusCode).toBe(302);
                            Comment.all()
                            .then((comments) => {
                                expect(err).toBeNull();
                                expect(comments.length).toBe(commentCountBeforeDelete - 1);
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
    });
});