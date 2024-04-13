import postgres from 'postgres';

const sql = postgres({
    host: 'localhost',
    port: 5432,
    database: 'praktikumstool',
    username: 'postgres',
    password: '1234',
    schema: 'public',
    connectTimeout: 10,
    ssl: { mode: 'prefer' }
});

async function executeQuery() {
    let data = await sql`
        SELECT COUNT(DISTINCT la."ID") AS total_applications,
        COUNT(DISTINCT CASE WHEN rce."BOOL" = true THEN la."ID" END) AS successful_finishes
        FROM "LABWORKAPPLICATIONS" la
        LEFT JOIN "REPORT_CARD_EVALUATION" rce ON la."LABWORK" = rce."LABWORK"
        WHERE la."LABWORK" = '5a81c332-34d9-4ced-b46d-3f02d1ce905d'
    `;
    return data;
}

let data = await executeQuery();
console.log(data);