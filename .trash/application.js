import * as d3 from "d3";
import pg from 'pg';
import { createBarChart } from '../src/client/barChart.js';
import { createPieChart } from '../src/client/piechart.js';
import { CloudflareSocket } from '../../node_modules/pg/index.js';

async function main() {

    let labworkUUID = "5a81c332-34d9-4ced-b46d-3f02d1ce905d";
    let labworkUUIDs = ['5df25fb9-d52d-445a-b6ea-017893c533ac', '003d4a10-3357-4ff1-aab1-92d9688f1193', '34043dd9-a72b-4328-8731-b8d061e10e33', '7aa0c375-6906-4a44-b7cc-bc906789c496', '5a81c332-34d9-4ced-b46d-3f02d1ce905d']
    // In the actual implementation, the labworkUUID would be included in the labwork's site, where the graphics would be available

    // Add event listeners
    document.getElementById('labwork-dropdown').addEventListener('change', updateLabworkUUID);
    document.getElementById('query1-button').addEventListener('click', () => executeQuery(1));
    document.getElementById('query2-button').addEventListener('click', () => executeQuery(2));

    const chartContainer = document.getElementById('chart-placeholder');


    // Create a PostgreSQL client
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
                console.log("Query 1 ran successfully!");
                console.log(result1.rows);
            })
            .catch(error => console.error('Error executing Query 1:', error));

        await client.query(AnmeldungenUndTeilnamenAnMeilensteinen)
            .then(result2 => {
                console.log("Query 2 ran successfully!");
                console.log(result2.rows);
            })
            .catch(error => console.error('Error executing Query 2:', error));

        // Make sure to close the database connection when your application exits
        process.on('exit', closeDatabase);

    console.log("Finished");

    // Function to select the query based on the button clicked
    async function executeQuery(queryNumber) {
        try {
            if (labworkUUID === "") throw "No Labwork selected.";
            let result;
            if (queryNumber === 1) {
                result = await client.query(AnmeldungenVsBestanden);
                let chart = await createPieChart(result.rows);
                await updateChart(chart);
            } else if (queryNumber === 2) {
                result = await client.query(AnmeldungenUndTeilnamenAnMeilensteinen);
                let chart = await createBarChart(result.rows);
                await updateChart(chart);
            }

            console.log(result.rows); // Log the result for verification
        } catch (error) {
            console.error('Error executing query:', error);
        }
    }

    // Function to update the chart with data
    async function updateChart(data) {
        // Set the innerHTML of the chart container with the new SVG content
        chartContainer.innerHTML = data;
    }

    // Function to update labworkUUID based on the selected dropdown value
    function updateLabworkUUID() {
        let index = document.getElementById('labwork-dropdown').value
        labworkUUID = labworkUUIDs[index];
    }

}

main()
