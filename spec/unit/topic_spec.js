const sequelize = require('../../src/db/models/index').sequelize;
const Topic = require('../../src/db/models').Topic;
const Post = require('../../src/db/models').Post;

describe('Topic', () => {
    beforeEach((done) => {
        this.topic;
        sequelize.sync({ force: true }).then((res) => {
            Topic.create({
                title: 'Phone Case or No Phone Case',
                description: 'A discussion debating whether to have a phone case or not'
            })
            .then((topic) => {
                this.topic = topic;
                done();
            })
            .catch((err) => {
                console.log(err);
                done();
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
                topicId: this.topic.id
            })
            .then((post) => {
                this.topic.getPosts()
                .then((posts) => {
                    expect(posts[0].title).toBe('Pictures of what happens when you don\'t have a phone case');
                    expect(posts[0].body).toBe('See pictures below :/');
                    done();
                });
            });
        });
    });
});