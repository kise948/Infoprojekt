const express = require('express');
const pg = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());

const port = 3000;

let semesterUUID = 'fdd602d4-660f-416f-9eac-88aa2596ac8a'; // WiSe 21/22
let degreeUUID = null;
let courseUUID = null;
let labworkUUID = null;
let degreeUUIDs = ['816a07ed-0f2c-4e4e-9e82-854722dcbc07', 'dc08c07e-6159-4519-9a6b-0635976e7fa3', 'c2aa93b4-9c49-4d0b-b550-a3d7a31fb3cd'];
let courseUUIDs = ['0fccbb81-8d70-456b-a2c9-cd09d9fc5253', '26c47e55-c7e3-4d78-83b2-cc92670817a7', '939eb0ab-7474-428c-8e6e-98c48597812e'];
let labworkUUIDs = ['5df25fb9-d52d-445a-b6ea-017893c533ac', '003d4a10-3357-4ff1-aab1-92d9688f1193',
    '34043dd9-a72b-4328-8731-b8d061e10e33', '7aa0c375-6906-4a44-b7cc-bc906789c496', '5a81c332-34d9-4ced-b46d-3f02d1ce905d'];


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

app.get('/api/Labworks/', async (req, res) => {
    const client = clientFactory()
    client.connect();
    const labworkUUID = labworkUUIDs[req.params.labworkUUID];
    const query = {
        text: `
            SELECT "ID" as value,
                   "LABEL" AS label
            FROM "LABWORK"
            WHERE "SEMESTER" = COALESCE($1, "SEMESTER")
              AND "COURSE" = COALESCE($2, "COURSE")
              AND "DEGREE" = COALESCE($3, "DEGREE")
            `,
        values: [semesterUUID, courseUUID, degreeUUID]
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

// TODO: Change WHERE clause to check for SEMESTER and COURSE
app.get('/api/anmeldungen-vs-bestanden/:courseUUID', async (req, res) => {
    const client = clientFactory()
    client.connect();
    const labworkUUID = labworkUUIDs[req.params.labworkUUID];
    const query = {
        text: `
            SELECT COUNT(DISTINCT "ID") as total_applications,
                   COUNT(DISTINCT CASE WHEN "BOOL" = True THEN "ID" END) AS successful_finishes
            FROM "REPORT_CARD_EVALUATION"
            WHERE "LABWORK" = COALESCE($1, "LABWORK")
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
