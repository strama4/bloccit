const sequelize = require('../../src/db/models/index').sequelize;
const Topic = require('../../src/db/models').Topic;
const User = require('../../src/db/models').User;
const Post = require('../../src/db/models').Post;
const Comment = require('../../src/db/models').Comment;
const Favorite = require('../../src/db/models').Favorite;

describe('Favorites', () => {
    beforeEach((done) => {
        this.user;
        this.topic;
        this.post;
        this.favorite;

        sequelize.sync({ force: true }).then(() => {
            User.create({
                email: 'starman@tesla.com',
                password: 'Trekkie4lyfe'    
            })
            .then((user) => {
                this.user = user;

                Topic.create({
                    title: 'Expeditions to Alpha Centauri',
                    description: 'A compilation of recent visits to the star system.',
                    posts: [{
                        title: 'My first visit to Proxima Centauri b',
                        body: 'I saw some rocks.',
                        userId: this.user.id 
                    }]
                }, { 
                    include: 
                        {model: Post, as: 'posts'}
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
        it('should create a new favourite object with associated user/post', (done) => {
            Favorite.create({
                userId: this.user.id,
                postId: this.post.id
            })
            .then((favorite) => {
                expect(favorite.id).not.toBeNull();
                expect(favorite.userId).toBe(this.user.id);
                expect(favorite.postId).toBe(this.post.id);
                done();
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });
        it('should not create a favorite object without a user/post', (done) => {
            Favorite.create({
                userId: null
            })
            .then((favorite) => {
                done();
            })
            .catch((err) => {
                expect(err.message).toContain('Favorite.userId cannot be null');
                expect(err.message).toContain('Favorite.postId cannot be null');
                done();
            });
        });
    });
    describe('#setUser()', () => {
        it('should set the selected user to the favorite object', (done) => {
            Favorite.create({
                    userId: this.user.id,
                    postId: this.post.id
                })
                .then((favorite) => {
                    this.favorite = favorite;
                    expect(favorite.userId).toBe(this.user.id);
                    
                    User.create({
                        email: 'bob@examples.com',
                        password: 'password'
                    })
                    .then((anotherUser) => {
                        this.favorite.setUser(anotherUser)
                        .then((favorite) => {
                            expect(favorite.userId).toBe(anotherUser.id);
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
    describe('#getUser()', () => {
        it('should return the user associate with the favorite object', (done) => {
            Favorite.create({
                userId: this.user.id,
                postId: this.post.id
            })
            .then((favorite) => {
                favorite.getUser()
                .then((user) => {
                    expect(user.email).toBe('starman@tesla.com');
                    done();
                });
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });
    });
    describe('#setPost()', () => {
        it('should set a post to the called favorite object', (done) => {
            Favorite.create({
                userId: this.user.id,
                postId: this.post.id
            })
            .then((favorite) => {
                this.favorite = favorite;
                
                Post.create({
                    title: 'The post you actually like',
                    body: 'It\'s just the best, obviously',
                    userId: this.user.id,
                    topicId: this.topic.id
                })
                .then((anotherPost) => {
                    expect(this.favorite.postId).toBe(this.post.id);
                    this.favorite.setPost(anotherPost)
                    .then((favorite) => {
                        expect(favorite.postId).toBe(anotherPost.id);
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
    describe('#getPost()', () => {
        it('should get the post that is associated with the favorite object', (done) => {
            Favorite.create({
                userId: this.user.id,
                postId: this.post.id
            })
            .then((favorite) => {
                favorite.getPost()
                .then((post) => {
                    expect(post.title).toBe('My first visit to Proxima Centauri b');
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