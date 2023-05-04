const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('./app');
const { Pool } = require('pg');
const config = require('./config');
const pool = new Pool(config.db);
const { expect } = chai;

chai.use(chaiHttp);

/****------------POST/incidents ----------****/
describe('Incidents API', () => {
    describe('POST /incidents', () => {
    it('should create a new incident and return the created incident with status 201', async () => {
        const incidentData = {
            client_id: 1,
            incident_desc: 'Test incident',
            city: 'New York',
            country: 'US',
        };

    const res = await chai.request(app).post('/incidents').send(incidentData);
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('client_id', incidentData.client_id);
    expect(res.body).to.have.property('incident_desc', incidentData.incident_desc);
    expect(res.body).to.have.property('city', incidentData.city);
    expect(res.body).to.have.property('country', incidentData.country);
    expect(res.body).to.have.property('weather_report');
});

    it('should return 500 if an error occurs', async () => {
        const incidentData = {
            client_id: 1,
            incident_desc: 'Test incident',
            city: '', // Invalid city, which should trigger an error
            country: 'US',
        };

    const res = await chai.request(app).post('/incidents').send(incidentData);
    expect(res.status).to.equal(500);
    expect(res.body).to.have.property('error');
});
});
});



/****------------GET/incidents ----------****/
describe('GET /incidents', () => {
    beforeEach(async () => {
    // Clean up the incidents table before each test
    await pool.query('DELETE FROM incidents');

    // Add sample data to the incidents table
    const incidentData = [
        { client_id: 1, incident_desc: 'Test incident 1', city: 'New York', country: 'US', date: new Date(), weather_report: { main: { temp: 20, humidity: 60 } } },
        { client_id: 2, incident_desc: 'Test incident 2', city: 'Los Angeles', country: 'US', date: new Date(), weather_report: { main: { temp: 25, humidity: 40 } } },
        { client_id: 3, incident_desc: 'Test incident 3', city: 'London', country: 'UK', date: new Date(), weather_report: { main: { temp: 15, humidity: 80 } } },
    ];

    for (const incident of incidentData) {
        const query = `
                INSERT INTO incidents (client_id, incident_desc, city, country, date, weather_report)
                VALUES ($1, $2, $3, $4, $5, $6);
            `;
        const values = [incident.client_id, incident.incident_desc, incident.city, incident.country, incident.date, incident.weather_report];
        await pool.query(query, values);
    }
});

it('should return all incidents if no filters are applied', async () => {
    const res = await chai.request(app).get('/incidents');
expect(res.status).to.equal(200);
expect(res.body).to.be.an('array');
expect(res.body.length).to.equal(3);
});

it('should return incidents filtered by city', async () => {
    const res = await chai.request(app).get('/incidents').query({ city: 'New York' });
expect(res.status).to.equal(200);
expect(res.body).to.be.an('array');
expect(res.body.length).to.equal(1);
expect(res.body[0]).to.have.property('city', 'New York');
});



it('should filter incidents by temperature range', async () => {
// Test data setup: insert a few incidents with different temperatures
// ...insert test data...

const res = await chai.request(app)
    .get('/incidents')
    .query({ min_temperature: 20, max_temperature: 30 });

expect(res.status).to.equal(200);
expect(res.body).to.be.an('array');
// Check that the incidents returned have temperatures within the specified range
res.body.forEach(incident => {
    const temperature = parseFloat(incident.weather_report.main.temp);
temperature.should.be.at.least(20);
temperature.should.be.at.most(30);
});
});

it('should filter incidents by humidity range', async () => {
// Test data setup: insert a few incidents with different humidity levels
// ...insert test data...

const res = await chai.request(app)
.get('/incidents')
.query({ min_humidity: 40, max_humidity: 60 });

expect(res.status).to.equal(200);
expect(res.body).to.be.an('array');
// Check that the incidents returned have humidity levels within the specified range
res.body.forEach(incident => {
const humidity = parseFloat(incident.weather_report.main.humidity);
humidity.should.be.at.least(40);
humidity.should.be.at.most(60);
});
});

it('should filter incidents by temperature and humidity range', async () => {
// Test data setup: insert a few incidents with different temperature and humidity levels
// ...insert test data...

const res = await chai.request(app)
.get('/incidents')
.query({ min_temperature: 20, max_temperature: 30, min_humidity: 40, max_humidity: 60 });

expect(res.status).to.equal(200);
expect(res.body).to.be.an('array');
// Check that the incidents returned have temperature and humidity levels within the specified range
res.body.forEach(incident => {
const temperature = parseFloat(incident.weather_report.main.temp);
const humidity = parseFloat(incident.weather_report.main.humidity);
temperature.should.be.at.least(20);
temperature.should.be.at.most(30);
humidity.should.be.at.least(40);
humidity.should.be.at.most(60);

});
});
});

/****------------POST/incidents/search ----------****/
describe('POST /incidents/search', () => {
    // Clean up the incidents table before each test
    beforeEach(async () => {
    await pool.query('DELETE FROM incidents');
});

it('should return incidents by country', async () => {
    // Test data setup: insert a few incidents with different countries
    // ...insert test data...

    const res = await chai.request(app)
    .post('/incidents/search')
    .send({ country: 'USA' });

expect(res.status).to.equal(200);
expect(res.body).to.be.an('array');
// Check that the incidents returned have the specified country
res.body.forEach(incident => {
    incident.country.should.equal('USA');
});
});

it('should return an error if country is not provided', async () => {
    const res = await chai.request(app)
    .post('/incidents/search')
    .send({});

expect(res.status).to.equal(400);
expect(res.body).to.be.an('object');
expect(res.body.error).to.equal('Country is required.');
});

it('should return an empty array if no incidents are found', async () => {
    const res = await chai.request(app)
    .post('/incidents/search')
    .send({ country: 'NonexistentCountry' });

expect(res.status).to.equal(200);
expect(res.body).to.be.an('array');
expect(res.body.length).to.equal(0);
});
});



