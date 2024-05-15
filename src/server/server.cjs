const express = require('express');
const pg = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());

const port = 3000;

let labworkUUID = "5a81c332-34d9-4ced-b46d-3f02d1ce905d";
let labworkUUIDs = ['5df25fb9-d52d-445a-b6ea-017893c533ac', '003d4a10-3357-4ff1-aab1-92d9688f1193',
    '34043dd9-a72b-4328-8731-b8d061e10e33', '7aa0c375-6906-4a44-b7cc-bc906789c496', '5a81c332-34d9-4ced-b46d-3f02d1ce905d']

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
    const labworkUUID = labworkUUIDs[req.params.labworkUUID];
    const query = {
        text: `
            SELECT COUNT(DISTINCT "ID") as total_applications,
                   COUNT(DISTINCT CASE WHEN "BOOL" = True THEN "ID" END) AS successful_finishes
            FROM "REPORT_CARD_EVALUATION"
            WHERE "LABWORK" = $1
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
    const labworkUUID = labworkUUIDs[req.params.labworkUUID];
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

app.get('/api/anmeldungen-und-teilnahmen2/:labworkUUID', async (req, res) => {
    const client = clientFactory();
    client.connect();
    const labworkUUID = labworkUUIDs[req.params.labworkUUID];
    const query = {
        text: `
            SELECT
                rce."ASSIGNMENT_INDEX" AS milestone_index,
                COUNT(rce."ID") AS total_entries,
                MAX(rce."DATE") AS max_date  
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
            res.json(data.rows);
        }else{
        console.error('Error fetching data', error);
        res.status(500).send('Error fetching data');
    }
        client.end();
});


app.listen(port, () => console.log(`Server listening on port ${port}`));
