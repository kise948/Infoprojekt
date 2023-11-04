async function main() {
    import("d3")
    const {Client} = require('pg');

    let courseUUID = '26c47e55-c7e3-4d78-83b2-cc92670817a7'; // DBS2
    let semesterUUID = '2f070457-52f6-4d42-9efd-9ab947003823'; // SS21
    let degreeUUID = '816a07ed-0f2c-4e4e-9e82-854722dcbc07'; // AI
    let labworkUUID = '5df25fb9-d52d-445a-b6ea-017893c533ac'; // DBS2-AI SS21

// Create a PostgreSQL client
    const client = new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'praktikumstool',
        password: '1234',
        port: 5432,
        sslmode: 'prefer',
        connect_timeout: 10,
        schemaName: 'public'
    });

// Connect to the PostgreSQL database
    client.connect();

// Fetch data from the database
    async function fetchData(queryString) {

        return client.query(queryString)
            .then(result => result.rows)
            .catch(error => {
                console.error('Error fetching data:', error);
                throw error;
            });
    }

    async function testData() {
        let q1 = `SELECT * FROM "LABWORK" WHERE "LABEL" LIKE 'DBS2%' and "SEMESTER" = '2f070457-52f6-4d42-9efd-9ab947003823'`;
        return client.query(q1)
            .then(result => result.rows)
            .catch(error => {
                console.error('Error fetching data:', error);
                throw error;
            });
    }

// Close the database connection when done
    function closeDatabase() {
        client.end();
    }

        // Query 1: Count of lab work applications and successful finishes
        const AnmeldungenVsBestanden = {
            text: `
                SELECT COUNT(DISTINCT la."ID") AS total_applications,
                COUNT(DISTINCT CASE WHEN rce."BOOL" = true THEN la."ID" END) AS successful_finishes
                FROM "LABWORKAPPLICATIONS" la
                LEFT JOIN "REPORT_CARD_EVALUATION" rce ON la."LABWORK" = rce."LABWORK"
                WHERE la."LABWORK" = $1;
            `,
            values: [labworkUUID]
};

    // Query 2: Count of total applicants and participants for each milestone
        const AnmeldungenUndTeilnamenAnMeilensteinen = {
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

    // Execute the queries
        client.query(AnmeldungenVsBestanden)
            .then(result1 => {
                console.log(result1);
            })
            .catch(error => console.error('Error executing Query 1:', error));

        client.query(AnmeldungenUndTeilnamenAnMeilensteinen)
            .then(result2 => {
                console.log(result2);
            })
            .catch(error => console.error('Error executing Query 2:', error));

    // Make sure to close the database connection when your application exits
        process.on('exit', closeDatabase);

    console.log("Finished")
}

main()