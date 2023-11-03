function main(){
    import("d3")
    const {Client} = require('pg');

    let course = "c or 1 = 1";
    let semester = "c or 1 = 1";
    let degree = "c or 1 = 1";

// Create a PostgreSQL client
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'praktikumstool',
        password: '1234',
        port: 5432,
    });

// Connect to the PostgreSQL database
    client.connect();

// Fetch data from the database
    function fetchData() {
        const query = 'SELECT * FROM your_table'; // Replace with your actual SQL query

        return client.query(query)
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
    const query1 = `
    SELECT COUNT(DISTINCT la.id) AS total_applications,
           COUNT(DISTINCT CASE WHEN rce.successfully_finished = true THEN la.id END) AS successful_finishes
    FROM LABWORKAPPLICATIONS la
    LEFT JOIN report_card_evaluation rce ON la.labwork = rce.labwork
    WHERE rce.bool = true AND la.course = ${course} AND la.semester = ${semester} AND la.degree = ${degree};
  `;

// Query 2: Count of total applicants and participants for each milestone
    const query2 = `
            SELECT
                rce.assignment_index AS milestone_index,
                COUNT(DISTINCT rce.id) AS total_entries
            FROM
                REPORT_CARD_ENTRY rce
            WHERE
                rce.labwork = $1
            GROUP BY
                rce.assignment_index;
        `;

// Execute the queries
    client.query(query1)
        .then(result1 => {
            // Process the result of Query 1
        })
        .catch(error => console.error('Error executing Query 1:', error));

    client.query(query2)
        .then(result2 => {
            // Process the result of Query 2
        })
        .catch(error => console.error('Error executing Query 2:', error));

// Make sure to close the database connection when your application exits
    process.on('exit', closeDatabase);


    console.log("Finished")
}

main()