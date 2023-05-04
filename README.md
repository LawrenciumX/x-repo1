# x-repo1
Incident Reporting API
This API allows users to report incidents, fetch all incidents with optional filters, and search for incidents by country.

## Table of Contents

* Installation

* Usage

   * Report an Incident
   * Fetch All Incidents
   * Search Incidents by Country
   
* Testing



## Installation
1. Clone the repository: 
   git clone https://[github.com/LawrenciumX/x-repo1](https://github.com/LawrenciumX/x-repo1/).git
   
2. Install dependencies:
   npm install
   
3. Configure a local POSTGRESQL Server

    * Config Parameters:  
      * db username: **_postgres_**
      * db password: **_admin_**
      * db schema: **_postgres_**

    * Create a Table called `Incident`

    ### Command:
    CREATE TABLE incidents (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL,
    incident_desc TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    date DATE NOT NULL,
    weather_report JSONB NOT NULL
   ); 
   
4. Run the server:
    npm start
   
   
## Usage
### Report an Incident
### Endpoint:  POST /incidents

### Request body:

  {
    "client_id": number,
    "incident_desc": string,
    "city": string,
    "country": string
  }
  
### Response:

  {
    "client_id": number,
    "incident_desc": string,
    "city": string,
    "country": string,
    "date": date,
    "weather_report": object
  }


### Fetch All Incidents
### Endpoint:  GET /incidents

### Query parameters:

* city (optional): filter by city
* min_temperature (optional): filter by minimum temperature
* max_temperature (optional): filter by maximum temperature
* min_humidity (optional): filter by minimum humidity
* max_humidity (optional): filter by maximum humidity
  
### Response:

[
  {
    "client_id": number,
    "incident_desc": string,
    "city": string,
    "country": string,
    "date": date,
    "weather_report": object
  }
]


### Search Incidents by Country
### Endpoint:  POST /incidents/search

### Request body:

  {
  "country": string
}
  
### Response:

 [
  {
    "client_id": number,
    "incident_desc": string,
    "city": string,
    "country": string,
    "date": date,
    "weather_report": object
  }
]


## Testing

### Run tests using:
npm test

This will execute integration tests for all API endpoints.



