const express = require('express');
const pg = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());

const port = 3000;

function clientFactory (){
    return new pg.Client({
        user: 'postgres',
        host: 'localhost',
        database: 'praktikumstool',
        password: '1234',
        port: 5432,
        sslmode: 'prefer',
        connect_timeout: 10,
        schemaName: 'public'
    });
}

async function executeQuery(queryText, values) {
    try {
        const result = await client.query(queryText, values);
        return result.rows;
    } catch (error) {
        console.error('Error executing query:', error);
        return null;
    }
}

app.get('/api/anmeldungen-vs-bestanden/:labworkUUID', async (req, res) => {
    const client = clientFactory()
    client.connect();
    const labworkUUID = req.params.labworkUUID;
    const query = {
        text: `
                SELECT COUNT(DISTINCT la."ID") AS total_applications,
                COUNT(DISTINCT CASE WHEN rce."BOOL" = true THEN la."ID" END) AS successful_finishes
                FROM "LABWORKAPPLICATIONS" la
                LEFT JOIN "REPORT_CARD_EVALUATION" rce ON la."LABWORK" = rce."LABWORK"
                WHERE la."LABWORK" = $1;
            `,
        values: [labworkUUID]
    };
    const data = await client.query(query)
    if (data) {
        console.log(data.rows);
        res.json(data);
    } else {
        res.status(500).send('Error fetching data');
    }
    client.end()
});

app.get('/api/anmeldungen-und-teilnahmen/:labworkUUID', async (req, res) => {
    const client = clientFactory();
    client.connect();
    const labworkUUID = req.params.labworkUUID;
    const query = {
        text: `
                SELECT
                    rce."ASSIGNMENT_INDEX" AS milestone_index,
                    COUNT(rce."ID") AS total_entries
                FROM
                    "REPORT_CARD_ENTRY" rce
                WHERE
                    rce."LABWORK" = $1
                GROUP BY
                    rce."ASSIGNMENT_INDEX";
            `,
        values: [labworkUUID]
    };
    const data = await client.query(query);
    if (data) {
        console.log(data.rows);
        res.json(data);
    } else {
        res.status(500).send('Error fetching data');
    }
    client.end();
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
