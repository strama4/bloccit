const sequelize = require('../../src/db/models/index').sequelize;
const Topic = require('../../src/db/models').Topic;
const Flair = require('../../src/db/models').Flair;

describe('Flair', () => {
    beforeEach((done) => {
        this.topic;
        this.flair;
        
        sequelize.sync({force:true}).then((res) => {
            Topic.create({
                title: 'Harry Potter and the Philosopher\'s Stone',
                description: 'A discussion among Muggles about the first book in the Harry Potter series'
            })
            .then((topic) => {
                this.topic = topic;
                Flair.create({
                    name: 'Important',
                    color: 'red',
                    topicId: this.topic.id
                })
                .then((flair) => {
                    this.flair = flair
                    done();
                });
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });
    });        
    describe('#create()', () => {
        it('should create a new flair with name, color and associated topic', (done) => {
            Flair.create({
                name: 'Funny',
                color: 'green',
                topicId: this.topic.id
            })
            .then((flair) => {
                expect(flair.name).toBe('Funny');
                expect(flair.color).toBe('green');
                expect(flair.id).toBe(2);
                done();
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });
        it('should not be able to create a flair when a name or color is missing', (done) => {
            Flair.create({
                name: 'Sad'
            })
            .then((flair) => {
                done();
            })
            .catch((err) => {
                expect(err.message).toContain('Flair.color cannot be null');
                done();
            });
        });
    });
    describe('#setTopic()', () => {
        it('should associate a flair and post together', (done) => {
            Topic.create({
                title: 'Harry Potter and the Chamber of Secrets',
                description: 'The saga continues... so does the conversation!'
            })
            .then((newTopic) => {
                expect(this.flair.topicId).toBe(this.topic.id);
                this.flair.setTopic(newTopic)
                .then((flair) => {
                    expect(flair.topicId).toBe(newTopic.id);
                    done();
                });
            });
        });
    });
    describe('#getTopic()', () => {
        it('should get the topic that is associated with the current flair', (done) => {
            this.flair.getTopic()
            .then((associatedTopic) => {
                expect(associatedTopic.title).toBe('Harry Potter and the Philosopher\'s Stone');
                done();
            })
        })
    })
});