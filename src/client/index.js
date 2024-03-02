import * as d3 from "d3";
import { createBarChart } from '../barchart.js';
import { createPieChart } from '../piechart.js';


document.getElementById('labwork-dropdown').addEventListener('change', updateLabworkUUID);
document.getElementById('query1-button').addEventListener('click', () => executeQuery(1));
document.getElementById('query2-button').addEventListener('click', () => executeQuery(2));

let labworkUUID = "5a81c332-34d9-4ced-b46d-3f02d1ce905d";
let labworkUUIDs = ['5df25fb9-d52d-445a-b6ea-017893c533ac', '003d4a10-3357-4ff1-aab1-92d9688f1193', '34043dd9-a72b-4328-8731-b8d061e10e33', '7aa0c375-6906-4a44-b7cc-bc906789c496', '5a81c332-34d9-4ced-b46d-3f02d1ce905d']
// In the actual implementation, the labworkUUID would be included in the labwork's site, where the graphics would be available
async function executeQuery(queryNumber) {
    console.log('Query number: ', queryNumber);
    const urls = [`http://localhost:3000/api/anmeldungen-vs-bestanden?labworkUUID=${labworkUUID}`,
        `http://localhost:3000/api/AnmeldungenUndTeilnamenAnMeilensteinen?labworkUUID=${labworkUUID}`];
    const url = urls[queryNumber-1];
    const response = await fetch(url);
    if (!response.ok) {
        console.error('Error fetching data:', response.statusText);
        return;
    }

    const data = await response.json(); // Parse the JSON response

    if (queryNumber === 1) {
        console.log('Executing query number: ', queryNumber);
        const chart = await createPieChart(data);
        await updateChart(chart);
    } else if (queryNumber === 2) {
        console.log('Executing query number: ', queryNumber);
        const chart = await createBarChart(data);
        await updateChart(chart);
    }
}

function updateLabworkUUID() {
    let index = document.getElementById('labwork-dropdown').value
    labworkUUID = labworkUUIDs[index];
    console.log('Updating Labwork UUID with: ', labworkUUID);
}

async function updateChart(svg) {
    console.log('Updating Chart...');
    // Clear the placeholder content before rendering
    const chartContainer = document.getElementById('chart-placeholder');
    chartContainer.innerHTML = "";
    console.log('Chart emptied...');
    chartContainer.appendChild(svg);
    console.log('Chart updated!');
}
