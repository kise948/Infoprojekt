function main(){
    import("d3")

    const {Client} = require('pg');

// Create a PostgreSQL client
    const client = new Client({
        user: 'your_db_user',
        host: 'your_db_host',
        database: 'your_db_name',
        password: 'your_db_password',
        port: 5432, // Your PostgreSQL port
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
    const query1 = {
        text: `
    SELECT COUNT(DISTINCT la.id) AS total_applications,
           COUNT(DISTINCT CASE WHEN rce.successfully_finished = true THEN la.id END) AS successful_finishes
    FROM labworkapplications la
    LEFT JOIN report_card_evaluation rce ON la.labwork = rce.labwork
    WHERE rce.bool = true AND la.course = $1 AND la.semester = $2 AND la.degree = $3;
  `,
        values: [courseUUID, semesterUUID, degreeUUID],
    };

// Query 2: Count of total applicants and participants for each milestone
    const query2 = {
        text: `
            SELECT
                rce.assignment_index AS milestone_index,
                COUNT(DISTINCT rce.id) AS total_entries
            FROM
                report_card_entry rce
            WHERE
                rce.labwork = $1
            GROUP BY
                rce.assignment_index;
        `,
        values: [courseUUID, semesterUUID, degreeUUID],
    };

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


    //getting example data
    const labwork = require("../json files/labwork.json")
    const labworkApp = require("../json files/LABWORKAPPLICATIONS.json")
    const courses = require("../json files/courses.json")
    const degrees = require("../json files/degrees.json")
    const repCardEntry = require("../json files/REPORT_CARD_ENTRY.json")
    const repCardEntryType = require("../json files/REPORT_CARD_ENTRY_TYPE.json")
    const repCardEval = require("../json files/REPORT_CARD_EVALUATION.json")
    //let milestones = new Map()
    let milestones = []

    // Ideally through the API get a json array containing all entries for a given year and labwork
    // Data required: REPORT_CARD_ENTRY -> LABEL (of each milestone), sum(*) of entries per milestone label
    for (let entry of repCardEntry){ //
        if(entry.LABWORK === "ef693956-6b7a-4731-8d89-f86aff0f14a8"){ //looking for ALL PP - AI associated report card entries
            let index = entry.ASSIGNMENT_INDEX
            if(typeof milestones[index] === 'undefined'){
                milestones[index] = {label: entry.LABEL, participants: 1}
            } else {milestones[index].participants++}
        }
    }
    console.log(JSON.stringify(milestones))
    console.log("Finished")
}

main()