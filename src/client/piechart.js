// Import D3
// noinspection DuplicatedCode

// import * as d3 from 'd3';
import {scaleOrdinal, pie, create, arc,} from "d3";

// Function to create a pie chart
async function createPieChart(data) {
    const width = 400;
    const height = 400;

    const color = scaleOrdinal()
        .domain(['Successful Finishes', 'Failures'])
        .range(['#2ecc71', '#e74c3c']);

    const pieGenerator = pie().sort(null).value((d) => d.value);
    const arcs = pieGenerator(data);

    const arcGenerator = arc()
        .innerRadius(0)
        .outerRadius(Math.min(width, height) / 2 - 1);

    // Create the SVG container.
    const svg = create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    svg.append("g")
        .attr("stroke", "white")
        .selectAll()
        .data(arcs)
        .join("path")
        .attr("fill", d => color(d.data.name))
        .attr("d", arcGenerator)
        .append("title")
        .text(d => `${d.data.name}: ${d.data.value.toLocaleString("de-DE")}`);

    svg.append("g")
        .attr("text-anchor", "middle")
        .selectAll()
        .data(arcs)
        .join("text")
        .attr("transform", d => `translate(${arcGenerator.centroid(d)})`)
        .call(text => text.append("tspan")
            .attr("y", "-0.4em")
            .attr("font-weight", "bold")
            .text(d => d.data.name))
        .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
            .attr("x", 0)
            .attr("y", "0.7em")
            .attr("fill-opacity", 0.7)
            .text(d => d.data.value.toLocaleString("de_DE")));

    return svg.node();
}

export default createPieChart;
