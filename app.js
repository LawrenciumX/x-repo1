const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { Pool } = require('pg');
const config = require('./config');

const pool = new Pool(config.db);
const app = express();

app.use(bodyParser.json());

// POST endpoint to receive incident report
app.post('/incidents', async (req, res) => {
    try {
        const { client_id, incident_desc, city, country } = req.body;
const weather_data = await getWeatherData(city, country);

const query = `
            INSERT INTO incidents (client_id, incident_desc, city, country, date, weather_report)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
const values = [client_id, incident_desc, city, country, new Date(), weather_data];
const result = await pool.query(query, values);
res.status(201).json(result.rows[0]);
} catch (err) {
    res.status(500).json({ error: err.message });
}
});


// GET endpoint to list all incidents with optional filters
app.get('/incidents', async (req, res) => {
    try {
        const { city, min_temperature, max_temperature, min_humidity, max_humidity } = req.query;

let query = `
            SELECT * FROM incidents WHERE 1 = 1
        `;
const values = [];

if (city) {
    query += ' AND city = $' + (values.length + 1);
    values.push(city);
}

if (min_temperature || max_temperature) {
    const weatherFilter = `weather_report ->> 'main' ->> 'temp'`;
    if (min_temperature) {
        query += ` AND ${weatherFilter} >= $` + (values.length + 1);
        values.push(min_temperature);
    }
    if (max_temperature) {
        query += ` AND ${weatherFilter} <= $` + (values.length + 1);
        values.push(max_temperature);
    }
}

if (min_humidity || max_humidity) {
    const humidityFilter = `weather_report ->> 'main' ->> 'humidity'`;
    if (min_humidity) {
        query += ` AND ${humidityFilter} >= $` + (values.length + 1);
        values.push(min_humidity);
    }
    if (max_humidity) {
        query += ` AND ${humidityFilter} <= $` + (values.length + 1);
        values.push(max_humidity);
    }
}

const result = await pool.query(query, values);
res.status(200).json(result.rows);
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

// POST endpoint to search incidents by country
app.post('/incidents/search', async (req, res) => {
    try {
        const { country } = req.body;

if (!country) {
    return res.status(400).json({ error: 'Country is required.' });
}

const query = `
            SELECT * FROM incidents WHERE country = $1
        `;
const values = [country];

const result = await pool.query(query, values);
res.status(200).json(result.rows);
} catch (err) {
    res.status(500).json({ error: err.message });
}
});



// Function to get weather data from OpenWeatherMap API
async function getWeatherData(city, country) {

    const apiKey = config.weather_api_key;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${apiKey}`;
    const response = await axios.get(url);

    return response.data;
}


app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});

module.exports = app;
