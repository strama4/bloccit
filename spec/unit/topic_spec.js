const sequelize = require('../../src/db/models/index').sequelize;
const Topic = require('../../src/db/models').Topic;
const Post = require('../../src/db/models').Post;
const User = require('../../src/db/models').User;

describe('Topic', () => {
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
                    description: 'A compilation of reports from recent visits to the star system',
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
                });
            });
        });
    });
    describe('#create()', () => {
        it('should create a topic when a valid title and description have been added', (done) => {
            Topic.create({
                title: 'Best Ways to Make Coffee',
                description: 'Coffee aficionados discuss ways they like to make their coffee'
            })
            .then((topic) => {
                expect(topic.title).toBe('Best Ways to Make Coffee');
                expect(topic.description).toBe('Coffee aficionados discuss ways they like to make their coffee');
                done();
            })
            .catch((err) => {
                console.log(err);
                done();
            });            
        });
        it('should not allow a topic to be created when missing either title or description', (done) => {
            Topic.create({
                description: 'Title says it all... This has to be the most important question of our time!!!'
            })
            .then((topic) => {
                done();
            })
            .catch((err) => {
                expect(err.message).toContain('Topic.title cannot be null');
                done();
            });
        });
    });
    describe('#getPosts()', () => {
        it('should return all of the post associated with that topic', (done) => {
            Post.create({
                title: 'Pictures of what happens when you don\'t have a phone case',
                body: 'See pictures below :/',
                topicId: this.topic.id,
                userId: this.user.id
            })
            .then((post) => {
                this.topic.getPosts()
                .then((posts) => {
                    expect(posts[0].title).toBe('My first visit to Proxima Centauri b');
                    expect(posts[0].body).toBe('I saw some rocks');
                    done();
                });
            });
        });
    });
});