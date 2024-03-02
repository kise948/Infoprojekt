const express = require('express');
const pg = require('pg');

const app = express();
const port = 3000; // or your desired port

const client = new pg.Client({
    user: 'postgres',
    host: 'localhost',
    database: 'praktikumstool',
    password: '1234',
    port: 5432,
    sslmode: 'prefer',
    connect_timeout: 10,
    schemaName: 'public'
});

client.connect();

// Function to execute a database query
async function executeQuery(queryText, values) {
    try {
        const result = await client.query(queryText, values);
        return result.rows;
    } catch (error) {
        console.error('Error executing query:', error);
        return null;
    }
}

app.get('/api/anmeldungen-vs-bestanden', async (req, res) => {
    const labworkUUID = req.query.labworkUUID;
    const query = `
    SELECT COUNT(DISTINCT la."ID") AS total_applications,
           COUNT(DISTINCT CASE WHEN rce."BOOL" = true THEN la."ID" END) AS successful_finishes
    FROM "LABWORKAPPLICATIONS" la
    LEFT JOIN "REPORT_CARD_EVALUATION" rce ON la."LABWORK" = rce."LABWORK"
    WHERE la."LABWORK" = $1;
  `;
    const data = await executeQuery(query, [labworkUUID]);
    if (data) {
        res.json(data);
    } else {
        res.status(500).send('Error fetching data');
    }
});

app.get('/api/AnmeldungenUndTeilnamenAnMeilensteinen', async (req, res) => {
    const labworkUUID = req.query.labworkUUID;
    const query = `
        SELECT
            rce."ASSIGNMENT_INDEX" AS milestone_index,
            COUNT(rce."ID") AS total_entries
        FROM
            "REPORT_CARD_ENTRY" rce
        WHERE
            rce."LABWORK" = $1
        GROUP BY
            rce."ASSIGNMENT_INDEX";
    `;
    const data = await executeQuery(query, [labworkUUID]);
    if (data) {
        res.json(data);
    } else {
        res.status(500).send('Error fetching data');
    }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));