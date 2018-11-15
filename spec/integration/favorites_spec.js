const sequelize = require('../../src/db/models/index').sequelize;
const request = require('request');
const server = require('../../src/server');
const base = 'http://localhost:3000/topics/';

const User = require('../../src/db/models').User;
const Topic = require('../../src/db/models').Topic;
const Post = require('../../src/db/models').Post;
const Favorite = require('../../src/db/models').Favorite;
const Comment = require('../../src/db/models').Comment;

describe('routes : favorites', () => {
    beforeEach((done) => {
        this.user;
        this.topic;
        this.post;
        this.favorite;
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
                        title: 'My first visit to Proxima Centauri b',
                        body: 'I saw a lot of rocks',
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
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });
    });

    // guest context
    describe('guest attempting to use favorites feature', () => {
        beforeEach((done) => {
            request.get({
                url: 'http://localhost:3000/fake/auth',
                form: {
                    userId: 0
                }
            }, (err, res, body) => {
                done();
            });
        });
        describe('POST /topics/:topicId/posts/:postId/favorites/create', () => {
            it('should not create a favorite object', (done) => {
                let favCountBeforeCreate;

                this.post.getFavorites()
                .then((favorites) => {
                    favCountBeforeCreate = favorites.length;
                    request.post(`${base}${this.topic.id}/posts/${this.post.id}/favorites/create`,
                    (err, res, body) => {
                        Favorite.all()
                        .then((favorites) => {
                            expect(favorites.length).toBe(favCountBeforeCreate);
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

    // member context
    describe('signed in user attempting to use favorites feature', () => {
        beforeEach((done) => {
            request.get({
                url: 'http://localhost:3000/auth/fake',
                form: {
                    userId: this.user.id,
                    role: 'member'
                }
            }, (err, res, body) => {
                done();
            });
        });

        describe('POST /topics/:topicId/posts/:postId/favorites/create', () => {
            it('should create a new favorite object', (done) => {
                request.post(`${base}${this.topic.id}/posts/${this.post.id}/favorites/create`,
                (err, res, body) => {
                    Favorite.findOne({
                        where: {
                            userId: this.user.id,
                            postId: this.post.id
                        }
                    })
                    .then((favorite) => {
                        expect(favorite).not.toBeNull();
                        expect(favorite.userId).toBe(this.user.id);
                        expect(favorite.postId).toBe(this.post.id);
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
        });

        describe('POST /topics/:topicId/posts/:postId/favorites/:id/destroy', () => {
                it("should destroy a favorite", (done) => {
                request.post(`${base}${this.topic.id}/posts/${this.post.id}/favorites/create`, 
                (err, res, body) => {
                    done();
                    this.post.getFavorites()
                    .then((favorites) => {
                        const favorite = favorites[0];
                        const favCountBeforeDelete = favorites.length;
                        request.post(`${base}${this.topic.id}/posts/${this.post.id}/favorites/${favorite.id}/destroy`, (err, res, body) => {
                            done();
                            this.post.getFavorites()
                            .then((updatedFavorites) => {
                                expect(updatedFavorites.length).toBe(favCountBeforeDelete - 1);
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
    });
});