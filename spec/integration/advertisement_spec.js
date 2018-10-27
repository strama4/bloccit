const request = require('request');
const server = require('../../src/server');
const base = 'http://localhost:3000/advertisement/';
const sequelize = require('../../src/db/models/index').sequelize;
const Advertisement = require('../../src/db/models').Advertisement;

describe('routes : advertisements', () => {
    beforeEach((done) => {
        this.advertisement;
        sequelize.sync({ force: true }).then(() => {
            Advertisement.create({
                title: 'Buy This Truck!',
                description: 'Get $1,500 in truck credits (minimum purchase must $3,000)'
            })
            .then((advertisement) => {
                this.advertisement = advertisement;
                done();
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });
    });
    describe('GET /advertisement', () => {
        it('should get back a status code 200 and get all advertisements', (done) => {
            request.get(base, (err, res, body) => {
                expect(res.statusCode).toBe(200);
                expect(err).toBeNull();
                expect(body).toContain('Advertisements');
                expect(body).toContain('Buy This Truck!');
                done();
            });
        });
    });
    describe('GET /advertisement/new', () => {
        it('should render a new advertisement form', (done) => {
            request.get(`${base}new`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain('New Advertisement');
                done();
            });
        });
    });
    describe('PUT /advertisement/create', () => {
        const options = {
            url: `${base}create`,
            form: {
                title: 'Widgets for Sale',
                description: 'Best widgets in the business'
            }
        }
        it('should create a new advertisement item and redirect to advertisement', (done) => {
            request.post(options, (err, res, body) => {
                Advertisement.findOne({ where: {title: 'Widgets for Sale'}})
                .then((advertisement) => {
                    expect(res.statusCode).toBe(303);
                    expect(advertisement.title).toBe('Widgets for Sale');
                    expect(advertisement.description).toBe('Best widgets in the business');
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });
        });
    });
    describe('GET /advertisement/:id', () => {
        it('should render the correct advertisement', (done) => {
            request.get(`${base}${this.advertisement.id}`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain('Buy This Truck!');
                done();
            });
        });
    });
    describe('POST /advertisement/:id/destroy', () => {
        it('should delete an advertisement with the associated ID', (done) => {
            Advertisement.findAll()
            .then((advertisements) => {
                const advertisementCountBeforeDelete = advertisements.length;
                expect(advertisementCountBeforeDelete).toBe(1);
                request.post(`${base}${this.advertisement.id}/destroy`, (err, res, body) => {
                    Advertisement.all()
                    .then((advertisements) => {
                        expect(err).toBeNull();
                        expect(advertisements.length).toBe(advertisementCountBeforeDelete - 1);
                        done();
                    });                    
                });
            });
        });
    });
    describe('GET /advertisement/:id/edit', () => {
        it('should render an edit advertisement form', (done) => {
            request.get(`${base}${this.advertisement.id}/edit`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain('Edit Advertisement');
                expect(body).toContain('Buy This Truck!');
                done();
            });
        });
    });
    describe('POST /advertisement/:id/update', () => {
        it('should update the advertisement with the given values', (done) => {
            const options = {
                url: `${base}${this.advertisement.id}/update`,
                form: {
                    title: 'Buy This Brand New Truck',
                    description: 'Get $1,500 in truck credits (minimum purchase must $4,000)'
                }
            }
            request.post(options, (err, res, body) => {
                expect(err).toBeNull();
                Advertisement.findOne({
                    where: { id: this.advertisement.id }
                })
                .then((advertisement) => {
                    expect(advertisement.title).toBe('Buy This Brand New Truck');
                    done();
                })
            })
        })
    })
});