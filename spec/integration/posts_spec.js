const request = require('request');
const server = require('../../src/server');
const base = 'http://localhost:3000/topics/';

const sequelize = require('../../src/db/models/index').sequelize;
const Topic = require('../../src/db/models').Topic;
const Post = require('../../src/db/models').Post;
const User = require('../../src/db/models').User;

describe('routes : posts', () => {
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
                    title: 'Winter Games',
                    description: 'Post your Winter Games stories',
                    posts: [{
                        title: 'Snowball Fighting',
                        body: 'So much snow!',
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
                    this.post = topic.posts[0]
                    done();
                });
            });
        });
    });

    // guest context
    describe('Guest using CRUD options for Post', () => {
        beforeEach((done) => {
            request.get({
                url: 'http://localhost:3000/auth/fake',
                form: {
                    id: 0
                }
            }, (err, res, body) => {
                done();
            });
        });
        describe('GET /topics/:topicId/posts/new', () => {
            it('should redirect to posts view', (done) => {
                request.get(`${base}${this.topic.id}/posts/new`, (err, res, body) => {
                    expect(err).toBeNull();
                    expect(body).not.toContain('New Post');
                    expect(body).toContain('Snowball Fighting');
                    done();
                });
            });
        });
        describe('POST /topics/:topicId/posts/create', () => {
            it('should not create a new post and redirect', (done) => {
                const options = {
                    url: `${base}${this.topic.id}/posts/create`,
                    form: {
                        title: 'Watching snow melt',
                        body: 'Without a doubt my favoriting things to do besides watching paint dry!'
                    }
                };
                request.post(options, (err, res, body) => {
                    Post.findOne({ where: {title: 'Watching snow melt'}})
                    .then((post) => {
                        expect(post).toBeNull();
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
            it('should not create a new post that fails validations', (done) => {
                const options = {
                    url: `${base}${this.topic.id}/posts/create`,
                    form: {
                        title: 'a',
                        body: 'b'
                    }
                }
                request.post(options, (err, res, body) => {
                    Post.findOne({where: {title: 'a'}})
                    .then((post) => {
                        expect(post).toBeNull();
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
        });
        describe('GET /topics/:topicId/posts/:id', () => {
            it('should render a view with the selected post', (done) => {
                request.get(`${base}${this.topic.id}/posts/${this.post.id}`, (err, res, body) => {
                    expect(err).toBeNull();
                    expect(body).toContain('Snowball Fighting');
                    done();
                });
            });
        });
        describe('POST /topics/:topicId/posts/:id/destroy', () => {
            it('should not delete the post with the associated ID', (done) => {
                Post.findAll({ where: {topicId: this.topic.id}})
                .then((posts) => {
                    let postsInTopic = posts.length;
                    expect(postsInTopic).toBe(1);
                    request.post(`${base}${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {
                        Post.findAll({ where: {topicId: this.topic.id}})
                        .then((posts) => {
                            expect(posts.length).toBe(postsInTopic);
                            done();
                        });
                    });
                });     
            });
        });
        describe('GET /topics/:topicId/posts/:id/edit', () => {
            it('should not render a view with an edit post form', (done) => {
                request.get(`${base}${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {
                    expect(err).toBeNull();
                    expect(body).not.toContain('Edit Post');
                    expect(body).toContain('Snowball Fighting');
                    done();
                });
            });
        });
        describe('POST /topics/:topicId/posts/:id/update', () => {
            // it('should return a status code 302', (done) => {
            //     request.post({
            //         url: `${base}${this.topic.id}/posts/${this.post.id}/update`,
            //         form: {
            //             title: 'Snowman Building Competition',
            //             body: 'I love watching them melt slowly.'
            //         }
            //     }, (err, res, body) => {
            //         expect(res.statusCode).toBe(302);
            //         done();
            //     });
            // });
            it('should not update the post with the given values', (done) => {
                const options = {
                    url: `${base}${this.topic.id}/posts/${this.post.id}/update`,
                    form: {
                        title: 'Snowman Building Competition',
                        body: 'I love watching them melt slowly.'
                    }
                };
                request.post(options, 
                    (err, res, body) => {
                        expect(err).toBeNull();
                        Post.findOne({
                            where: {id: this.post.id}
                        })
                        .then((post) => {
                            expect(post.title).toBe('Snowball Fighting');
                            done();
                        });
                });
            });
        });
    });

    // member/owner context
    describe('Member using CRUD options for Post', () => {
        beforeEach((done) => {
            User.create({
                email: 'johnnyboy@gmail.com',
                password: 'password'
            })
            .then((user) => {
                Post.create({
                    title: 'Watching snowman competitions',
                    body: 'I like watching them melt slowly',
                    topicId: this.topic.id,
                    userId: user.id
                })
                .then((post) => {
                    request.get({
                        url: 'http://localhost:3000/auth/fake',
                        form: {
                            userId: this.user.id,
                            role: 'member',
                            email: this.user.email
                        }
                    }, (err, res, body) => {
                        done();
                    });
                });
            });            
        });

        describe('GET /topics/:topicId/posts/new', () => {
            it('should render a form to create a new post', (done) => {
                request.get(`${base}${this.topic.id}/posts/new`, (err, res, body) => {
                    
                    expect(err).toBeNull();
                    expect(body).toContain('New Post');
                    done();
                });
            });
        });
        describe('POST /topics/:topicId/posts/create', () => {
            it('should create a new post and redirect', (done) => {
                const options = {
                    url: `${base}${this.topic.id}/posts/create`,
                    form: {
                        title: 'Watching snow melt',
                        body: 'Without a doubt my favoriting things to do besides watching paint dry!'
                    }
                };
                request.post(options, (err, res, body) => {
                    Post.findOne({ where: {title: 'Watching snow melt'}})
                    .then((post) => {
                        expect(post).not.toBeNull();
                        expect(post.title).toBe('Watching snow melt');
                        expect(post.body).toBe('Without a doubt my favoriting things to do besides watching paint dry!');
                        expect(post.topicId).not.toBeNull();
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
            it('should not create a new post that fails validations', (done) => {
                const options = {
                    url: `${base}${this.topic.id}/posts/create`,
                    form: {
                        title: 'a',
                        body: 'b'
                    }
                }
                request.post(options, (err, res, body) => {
                    Post.findOne({where: {title: 'a'}})
                    .then((post) => {
                        expect(post).toBeNull();
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
        });
        describe('GET /topics/:topicId/posts/:id', () => {
            it('should render a view with the selected post', (done) => {
                request.get(`${base}${this.topic.id}/posts/${this.post.id}`, (err, res, body) => {
                    expect(err).toBeNull();
                    expect(body).toContain('Snowball Fighting');
                    done();
                });
            });
        });
        describe('POST /topics/:topicId/posts/:id/destroy', () => {
            it('should delete the post with the associated topic ID and when it\'s the owner', (done) => {
                Post.findAll({ where: {topicId: this.topic.id}})
                .then((posts) => {
                    let postsInTopic = posts.length;
                    expect(postsInTopic).toBe(2);
                    request.post(`${base}${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {
                        Post.findAll({ where: {topicId: this.topic.id}})
                        .then((posts) => {
                            expect(posts.length).toBe(postsInTopic - 1);
                            done();
                        });
                    });
                });     
            });
            it('should not delete the post if member is not the owner of it', (done) => {
                Post.findOne({ where: {title: 'Watching snowman competitions'}}) // post not created by owner
                .then((post) => {
                    request.post(`${base}${this.topic.id}/posts/${post.id}/destroy`,
                    (err, res, body) => {
                        expect(err).toBeNull();
                        Post.findAll({where : {topicId: this.topic.id}})
                        .then((posts) => {
                            expect(posts.length).toBe(2);
                            done();
                        });
                    });
                });
            });
        });
        describe('GET /topics/:topicId/posts/:id/edit', () => {
            it('should render a view with an edit post form if the owner', (done) => {
                request.get(`${base}${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {
                    expect(err).toBeNull();
                    expect(body).toContain('Edit Post');
                    expect(body).toContain('Snowball Fighting');
                    done();
                });
            });
            it('should not render a view with an edit post form if not the owner', (done) => {
                Post.findOne({where: {title: 'Watching snowman competitions'}})
                .then((post) => {
                    request.get(`${base}${this.topic.id}/posts/${post.id}/edit`, (err, res, body) => {
                        expect(err).toBeNull();
                        expect(body).toContain('Watching snowman competitions');
                        expect(body).not.toContain('Edit Post');
                        done();
                    });
                });
            });
        });
        describe('POST /topics/:topicId/posts/:id/update', () => {
            it('should return a status code 302 if the owner', (done) => {
                request.post({
                    url: `${base}${this.topic.id}/posts/${this.post.id}/update`,
                    form: {
                        title: 'Snowman Building Competition',
                        body: 'I love watching them melt slowly.'
                    }
                }, (err, res, body) => {
                    expect(res.statusCode).toBe(302);
                    done();
                });
            });
            it('should update the post with the given values if the owner', (done) => {
                const options = {
                    url: `${base}${this.topic.id}/posts/${this.post.id}/update`,
                    form: {
                        title: 'Snowman Building Competition',
                        body: 'I love watching them melt slowly.'
                    }
                };
                request.post(options, 
                    (err, res, body) => {
                        expect(err).toBeNull();
                        Post.findOne({
                            where: {id: this.post.id}
                        })
                        .then((post) => {
                            expect(post.title).toBe('Snowman Building Competition');
                            done();
                        });
                });
            });
            it('should not update the post if not the owner', (done) => {
                Post.findOne({where: {title: 'Watching snowman competitions'}})
                .then((post) => {
                    const options = {
                        url: `${base}${this.topic.id}/posts/${post.id}/update`,
                        form: {
                            title: 'Watching the World Snowman Competitions',
                            body: 'Now those are snowmen!!'
                        }
                    }
                    request.post(options, (err, res, body) => {
                        Post.findOne({where: {title: 'Watching snowman competitions'}})
                        .then((post) => {
                            expect(err).toBeNull();
                            expect(post.title).toBe('Watching snowman competitions');
                            expect(post.body).toBe('I like watching them melt slowly');
                            done();
                        });
                    });
                });
            });
        });
    });

    // admin context
    describe('Admin using CRUD options for Post', () => {
        beforeEach((done) => {
            request.get({
                url: 'http://localhost:3000/auth/fake',
                form: {
                    role: 'admin'
                }
            }, (err, res, body) => {
                done();
            });
        });
        describe('GET /topics/:topicId/posts/new', () => {
            it('should render a form to create a new post', (done) => {
                request.get(`${base}${this.topic.id}/posts/new`, (err, res, body) => {
                    expect(err).toBeNull();
                    expect(body).toContain('New Post');
                    done();
                });
            });
        });
        describe('POST /topics/:topicId/posts/create', () => {
            it('should create a new post and redirect', (done) => {
                const options = {
                    url: `${base}${this.topic.id}/posts/create`,
                    form: {
                        title: 'Watching snow melt',
                        body: 'Without a doubt my favoriting things to do besides watching paint dry!'
                    }
                };
                request.post(options, (err, res, body) => {
                    Post.findOne({ where: {title: 'Watching snow melt'}})
                    .then((post) => {
                        expect(post).not.toBeNull();
                        expect(post.title).toBe('Watching snow melt');
                        expect(post.body).toBe('Without a doubt my favoriting things to do besides watching paint dry!');
                        expect(post.topicId).not.toBeNull();
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
            it('should not create a new post that fails validations', (done) => {
                const options = {
                    url: `${base}${this.topic.id}/posts/create`,
                    form: {
                        title: 'a',
                        body: 'b'
                    }
                }
                request.post(options, (err, res, body) => {
                    Post.findOne({where: {title: 'a'}})
                    .then((post) => {
                        expect(post).toBeNull();
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
        });
        describe('GET /topics/:topicId/posts/:id', () => {
            it('should render a view with the selected post', (done) => {
                request.get(`${base}${this.topic.id}/posts/${this.post.id}`, (err, res, body) => {
                    expect(err).toBeNull();
                    expect(body).toContain('Snowball Fighting');
                    done();
                });
            });
        });
        describe('POST /topics/:topicId/posts/:id/destroy', () => {
            it('should delete the post with the associated ID', (done) => {
                Post.findAll({ where: {topicId: this.topic.id}})
                .then((posts) => {
                    let postsInTopic = posts.length;
                    expect(postsInTopic).toBe(1);
                    request.post(`${base}${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {
                        Post.findAll({ where: {topicId: this.topic.id}})
                        .then((posts) => {
                            expect(posts.length).toBe(postsInTopic -1);
                            done();
                        });
                    });
                });     
            });
        });
        describe('GET /topics/:topicId/posts/:id/edit', () => {
            it('should render a view with an edit post form', (done) => {
                request.get(`${base}${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {
                    expect(err).toBeNull();
                    expect(body).toContain('Edit Post');
                    expect(body).toContain('Snowball Fighting');
                    done();
                });
            });
        });
        describe('POST /topics/:topicId/posts/:id/update', () => {
            it('should return a status code 302', (done) => {
                request.post({
                    url: `${base}${this.topic.id}/posts/${this.post.id}/update`,
                    form: {
                        title: 'Snowman Building Competition',
                        body: 'I love watching them melt slowly.'
                    }
                }, (err, res, body) => {
                    expect(res.statusCode).toBe(302);
                    done();
                });
            });
            it('should update the post with the given values', (done) => {
                const options = {
                    url: `${base}${this.topic.id}/posts/${this.post.id}/update`,
                    form: {
                        title: 'Snowman Building Competition',
                        body: 'I love watching them melt slowly.'
                    }
                };
                request.post(options, 
                    (err, res, body) => {
                        expect(err).toBeNull();
                        Post.findOne({
                            where: {id: this.post.id}
                        })
                        .then((post) => {
                            expect(post.title).toBe('Snowman Building Competition');
                            done();
                        });
                });
            });
        });
    });
});