// TODO: To run, use the command "npm start", this will start the server and open the frontend in your default browser
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
let degreeUUIDs = [null, '816a07ed-0f2c-4e4e-9e82-854722dcbc07', 'dc08c07e-6159-4519-9a6b-0635976e7fa3', 'c2aa93b4-9c49-4d0b-b550-a3d7a31fb3cd'];
let courseUUIDs = [null, '0c23b50c-e486-4cdb-b36b-b14031c3df9e', '0f219d9d-d016-4b54-8dbf-8072c84ee016', 'a3a0b357-39ff-4f9d-9090-ef84bf778eb2'];


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

function isValidUUID(str) {
    // Regular expression to check for a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}
// Reportcardentry erstellt - Entrytypes null
// Meilenstein Teilgenommen wenn zugehöriges Reportcardentrytype Anwesenheitspflichtig = True ODER Testat != Null
app.get('/api/Labworks/', async (req, res) => {
    const client = clientFactory()
    client.connect();

    const degreeIndex = parseInt(req.query.degreeIndex);
    const courseIndex = parseInt(req.query.courseIndex);
    degreeUUID = degreeUUIDs[degreeIndex];
    courseUUID = courseUUIDs[courseIndex];

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

app.get('/api/anmeldungen-vs-bestanden/:labworkUUID', async (req, res) => {
    const client = clientFactory();
    client.connect();

    labworkUUID = isValidUUID(req.params.labworkUUID) ? req.params.labworkUUID : null;

    const query = {
        text: `
            SELECT COUNT(DISTINCT rce."ID") as total_applications,
                   COUNT(DISTINCT CASE WHEN rce."BOOL" IS True THEN rce."ID" END) AS successful_finishes
            FROM "REPORT_CARD_EVALUATION" rce, "LABWORK" lab
            WHERE rce."LABWORK" = COALESCE($1, rce."LABWORK")
              AND rce."LABWORK" = lab."ID"
              AND lab."SEMESTER" = COALESCE($2, lab."SEMESTER")
              AND lab."COURSE" = COALESCE($3, lab."COURSE")
              AND lab."DEGREE" = COALESCE($4, lab."DEGREE")
            `,
        values: [labworkUUID, semesterUUID, courseUUID, degreeUUID]
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


app.get('/api/anmeldungen-und-teilnahmen/:labworkUUID', async (req, res) => {
    const client = clientFactory();
    client.connect();

    labworkUUID = isValidUUID(req.params.labworkUUID) ? req.params.labworkUUID : null;

    const query = {
        text: `
            SELECT
                rcen."ASSIGNMENT_INDEX" AS milestone_index,
                COUNT(DISTINCT CASE WHEN rcet."BOOL" IS NOT FALSE
                    AND rcet."ENTRY_TYPE" = 'Anwesenheitspflichtig' THEN rcen."ID" END) AS total_entries
            FROM "REPORT_CARD_ENTRY" rcen, "REPORT_CARD_ENTRY_TYPE" rcet, "LABWORK" lab
            WHERE rcet."REPORT_CARD_ENTRY" = rcen."ID"
              AND rcen."LABWORK" = lab."ID"
              AND rcen."LABWORK" = COALESCE($1, rcen."LABWORK")
              AND lab."SEMESTER" = COALESCE($2, lab."SEMESTER")
              AND lab."COURSE" = COALESCE($3, lab."COURSE")
              AND lab."DEGREE" = COALESCE($4, lab."DEGREE")
            GROUP BY rcen."ASSIGNMENT_INDEX";
        `,
        values: [labworkUUID, semesterUUID, courseUUID, degreeUUID]
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

    labworkUUID = isValidUUID(req.params.labworkUUID) ? req.params.labworkUUID : null;

    const query = {
        text: `
            SELECT
                rce."ASSIGNMENT_INDEX" AS milestone_index,
                COUNT(rce."ID") AS total_entries,
                MAX(rce."DATE") AS max_date  
            FROM
                "REPORT_CARD_ENTRY" rce, "LABWORK" lab
            WHERE
                rce."LABWORK" = COALESCE($1, rce."LABWORK")
              AND rce."LABWORK" = lab."ID"
              AND lab."SEMESTER" = COALESCE($2, lab."SEMESTER")
            GROUP BY
                rce."ASSIGNMENT_INDEX";
        `,
        values: [labworkUUID, semesterUUID]
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

app.get('/api/durchfall-profs/', async (req, res) => {
    const client = clientFactory();
    client.connect();

    const query = {
        text: `
            WITH DistinctEvaluations AS (
                SELECT DISTINCT ON (r."STUDENT", r."LABWORK")
                    r."LABWORK",
                    r."STUDENT",
                    l."COURSE",
                    CASE WHEN r."BOOL" = FALSE OR r."BOOL" IS NULL THEN 1 ELSE 0 END AS is_failed
                FROM
                    "REPORT_CARD_EVALUATION" r
                        JOIN
                    "LABWORK" l ON r."LABWORK" = l."ID"
                ORDER BY
                    r."STUDENT", r."LABWORK", r."ID"  -- Adjust the ORDER BY clause as needed
            ),
                 FailuresPerProfessor AS (
                     SELECT
                         c."LECTURER" AS professor_id,
                         COUNT(*) AS total_students,
                         SUM(is_failed) AS failed_students
                     FROM
                         DistinctEvaluations de
                             JOIN
                         "COURSES" c ON de."COURSE" = c."ID"
                     GROUP BY
                         c."LECTURER"
                 )
            SELECT
                u."FIRSTNAME",
                u."LASTNAME",
                fpp.total_students,
                fpp.failed_students,
                (fpp.failed_students::decimal / fpp.total_students) * 100 AS failure_percentage
            FROM
                FailuresPerProfessor fpp
                    JOIN
                "USERS" u ON fpp.professor_id = u."ID"
            ORDER BY
                failure_percentage DESC;
        `
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



// TODO: Performance des Praktikums ueber mehrere Semester
app.get('/api/performance-query/:courseIndex', async (req, res) => {
    const client = clientFactory();
    client.connect();
    let index = Number(req.params.courseIndex) ?? 0;
    courseUUID = courseUUIDs[index];

    const query = {
        text: `
            WITH DistinctEvaluations AS (
                SELECT DISTINCT ON (r."STUDENT", r."LABWORK")
                    r."LABWORK",
                    r."STUDENT",
                    l."COURSE",
                    l."SEMESTER",
                    CASE WHEN r."BOOL" = FALSE OR r."BOOL" IS NULL THEN 1 ELSE 0 END AS is_failed
                FROM
                    "REPORT_CARD_EVALUATION" r
                        JOIN
                    "LABWORK" l ON r."LABWORK" = l."ID"
                ORDER BY
                    r."STUDENT", r."LABWORK", r."ID"
            ),
                 PerformanceQuery AS (
                     SELECT
                         de."SEMESTER" AS semester,
                         COUNT(*) AS total_students,
                         SUM(is_failed) AS failed_students
                     FROM
                         DistinctEvaluations de
                             JOIN
                         "COURSES" c ON de."COURSE" = c."ID"
                     WHERE
                         de."COURSE" = $1
                     GROUP BY
                         semester
                 )
            SELECT
                s."LABEL",
                pq.total_students,
                pq.failed_students,
                (pq.failed_students::decimal / pq.total_students) * 100 AS failure_percentage
            FROM
                PerformanceQuery pq
                    JOIN
                "SEMESTERS" s ON pq.semester = s."ID"
            ORDER BY
                s."START" ASC;
        `, values: [courseUUID]
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
