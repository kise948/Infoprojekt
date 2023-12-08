async function main() {
    import("d3")
    const {Client} = require('pg');
    const { createBarChart } = await import('./barchart.js');

    let courseUUID = '26c47e55-c7e3-4d78-83b2-cc92670817a7'; // DBS2
    let semesterUUID = '2f070457-52f6-4d42-9efd-9ab947003823'; // SS21
    let degreeUUID = '816a07ed-0f2c-4e4e-9e82-854722dcbc07'; // AI
    let labworkUUID = '5df25fb9-d52d-445a-b6ea-017893c533ac'; // DBS2-AI SS21
    let labworkUUIDs = ['5df25fb9-d52d-445a-b6ea-017893c533ac', '003d4a10-3357-4ff1-aab1-92d9688f1193', '34043dd9-a72b-4328-8731-b8d061e10e33', '7aa0c375-6906-4a44-b7cc-bc906789c496', '5a81c332-34d9-4ced-b46d-3f02d1ce905d']


    // Add change event listeners
    document.getElementById('labwork-dropdown').addEventListener('change', updateLabworkUUID);
    document.getElementById('query1-button').addEventListener('click', () => executeQuery(1));
    document.getElementById('query2-button').addEventListener('click', () => executeQuery(2));


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
        await client.query(AnmeldungenVsBestanden)
            .then(result1 => {
                console.log("Query 1 ran successfully!")
                console.log(result1.rows);
            })
            .catch(error => console.error('Error executing Query 1:', error));

        await client.query(AnmeldungenUndTeilnamenAnMeilensteinen)
            .then(result2 => {
                console.log("Query 2 ran successfully!")
                console.log(result2.rows);
            })
            .catch(error => console.error('Error executing Query 2:', error));

        // Make sure to close the database connection when your application exits
        process.on('exit', closeDatabase);

    console.log("Finished")

    // Function to select the query based on the button clicked
    async function executeQuery(queryNumber) {
        try {
            let result;
            if (queryNumber === 1) {
                result = await client.query(AnmeldungenVsBestanden);
                let chart = await createBarChart(result.rows)
                updateChart(chart)
            } else if (queryNumber === 2) {
                result = await client.query(AnmeldungenUndTeilnamenAnMeilensteinen);
                let chart = await createBarChart(result.rows)
                updateChart(chart)
            }

            console.log(result.rows); // Log the result for verification
        } catch (error) {
            console.error('Error executing query:', error);
        }
    }

    // Function to update the chart with data
    function updateChart(data) {
        const chartContainer = document.getElementById('chart-placeholder');
        chartContainer.innerText = JSON.stringify(data, null, 2);
    }

    // Function to update labworkUUID based on the selected dropdown value
    function updateLabworkUUID() {
        let index = document.getElementById('milestone-dropdown').value
        labworkUUID = labworkUUIDs[index];
    }

}


main()