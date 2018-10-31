const request = require('request');
const server = require('../../src/server');
const base = 'http://localhost:3000/topics/'

const sequelize = require('../../src/db/models/index').sequelize;
const Topic = require('../../src/db/models').Topic;
const Flair = require('../../src/db/models').Flair;


describe('flair : routes', () => {
    beforeEach((done) => {
        this.topic;
        this.flair;
        sequelize.sync({force:true}).then((res) => {
            Topic.create({
                title: 'Soccer: The Beautiful Game',
                description: 'All things soccer'
            })
            .then((topic) => {
                this.topic = topic;
                Flair.create({
                    name: 'Interesting',
                    color: 'blue',
                    topicId: this.topic.id
                })
                .then((flair) => {
                    this.flair = flair;
                    done();
                });
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });
    });
    describe('GET /topics/:topicId/flairs/new', () => {
        it('should render a page to create a new flair for the topic', (done) => {
            request.get(`${base}${this.topic.id}/flairs/new`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain('New Flair');
                done();
            });
        });
    });
    describe('POST /topics/:topicId/flairs/create', () => {
        it('should create new flair associated with topic and redirect to topic', (done) => {
            const options = {
                url: `${base}${this.topic.id}/flairs/create`,
                form: {
                    name: 'Important',
                    color: 'red'
                }
            }
            request.post(options, (err, res, body) => {
                Flair.findOne({where: {name: 'Important'}})
                .then((flair) => {
                    expect(flair).not.toBeNull();
                    expect(flair.name).toBe('Important');
                    expect(flair.color).toBe('red');
                    expect(flair.topicId).not.toBeNull();
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });
        });
    });
    describe('GET /topics/:topicId/flairs/:id', () => {
        it('should render a view for a flair', (done) => {
            request.get(`${base}${this.topic.id}/flairs/${this.flair.id}`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain('Interesting');
                expect(body).toContain('blue')
                done();
            });
        });
    });
    describe('POST /topics/:topicId/flairs/:id/destroy', () => {
        it('should delete a flair with the associated ID', (done) => {
            Flair.findAll({where: {topicId: this.topic.id}})
            .then((flairs) => {
                let flairCountBeforeDelete = flairs.length;
                expect(flairCountBeforeDelete).toBe(1);
                request.post(`${base}${this.flair.topicId}/flairs/${this.flair.id}/destroy`, (err, res, body) => {
                    Flair.all({Where: {topicId: this.topic.id}})
                    .then((flairs) => {
                        expect(flairs.length).toBe(flairCountBeforeDelete - 1);
                        expect(this.flair.id).toBeUndefined;
                        done();
                    });
                });
            });
        });
    });
    describe('GET /topics/:topicId/flairs/:id/edit', () => {
        it('should render an edit view with the correct flair data', (done) => {
            request.get(`${base}${this.flair.topicId}/flairs/${this.flair.id}/edit`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain('Edit Flair');
                expect(body).toContain('Interesting');
                done();
            });
        });
    });
    describe('POST /topics/:topicId/flairs/:id/update', () => {
        it('should return a status code 302', (done) => {
            const options = {
                url: `${base}${this.flair.topicId}/flairs/${this.flair.id}/update`,
                form: {
                    name: 'Important',
                    color: 'blue'
                }
            }
            request.post(options, (err, res, body) => {
                expect(res.statusCode).toBe(302);
                done();
            })
        })
        it('should update the flair with the given values and redirect to it', (done) => {
            const options = {
                url: `${base}${this.flair.topicId}/flairs/${this.flair.id}/update`,
                form: {
                    name: 'Important',
                    color: 'blue'
                }
            }
            request.post(options, (err, res, body) => {
                expect(err).toBeNull();
                Flair.findOne({where: {id: this.flair.id}})
                .then((flair) => {
                    expect(flair.name).toBe('Important');
                    done();
                })
            })
        })
    })
});