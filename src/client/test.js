import fs from 'fs';
import createPieChart from '../client/piechart.js';
import postgres from 'postgres';


const sql = postgres({
    host: 'localhost',
    port: 5432,
    database: 'praktikumstool',
    username: 'postgres',
    password: '1234',
    schema: 'public',
    connectTimeout: 10,
    ssl: {mode: 'prefer'}
});

async function executeQuery() {
    const data = sql`
        SELECT COUNT(DISTINCT la."ID") AS total_applications,
               COUNT(DISTINCT CASE WHEN rce."BOOL" = true THEN la."ID" END) AS successful_finishes
        FROM "LABWORKAPPLICATIONS" la
                 LEFT JOIN "REPORT_CARD_EVALUATION" rce ON la."LABWORK" = rce."LABWORK"
        WHERE la."LABWORK" = '5a81c332-34d9-4ced-b46d-3f02d1ce905d';
    `;

    const chart = await createPieChart(data);
    await updateChart(chart);
}

async function updateChart(svg) {
    let fileName = "test.svg"
    console.log('Updating Chart...');
    fs.writeFile(fileName, svg, (err) => {
        if (err) {
            console.error('Error saving SVG:', err);
        } else {
            console.log('SVG saved successfully:', fileName);
        }
    });
    console.log('Chart updated!');
}

await executeQuery();