//https://observablehq.com/@d3/horizontal-bar-chart/2?intent=fork

import {scaleLinear, max, scaleBand, create, axisLeft, axisTop} from "d3";

async function createBarChart(data) {
    // Sort the data based on milestone_index in ascending order
    data.sort((a, b) => a.milestone_index - b.milestone_index);

    // Specify the chart’s dimensions, based on a bar’s height.
    const barHeight = 25;
    const marginTop = 30;
    const marginRight = 20;
    const marginBottom = 50; // Increased margin for axis labels
    const marginLeft = 60;
    const width = 600; // Adjust the width as needed
    const height = Math.ceil((data.length + 0.1) * barHeight) + marginTop + marginBottom;

    // Create the scales.
    const x = scaleLinear()
        .domain([0, max(data, d => parseInt(d.total_entries))])
        .range([marginLeft, width - marginRight]);

    const y = scaleBand()
        .domain(data.map(d => d.milestone_index))
        .rangeRound([marginTop, height - marginBottom])
        .padding(0.1);

    // Create the SVG container.
    const svg = create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    // Append a rect for each milestone.
    svg.append("g")
        .attr("fill", "steelblue")
        .selectAll()
        .data(data)
        .join("rect")
        .attr("x", x(0))
        .attr("y", (d) => y(d.milestone_index))
        .attr("width", (d) => x(parseInt(d.total_entries)) - x(0))
        .attr("height", y.bandwidth());

    // Append a label for each milestone.
    svg.append("g")
        .attr("fill", "white")
        .attr("text-anchor", "end")
        .selectAll()
        .data(data)
        .join("text")
        .attr("x", (d) => x(parseInt(d.total_entries)))
        .attr("y", (d) => y(d.milestone_index) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("dx", -4)
        .text((d) => d.total_entries)
        .call((text) => text.filter(d => x(parseInt(d.total_entries)) - x(0) < 20) // short bars
            .attr("dx", +4)
            .attr("fill", "black")
            .attr("text-anchor", "start"));

    // Create the axes.
    svg.append("g")
        .attr("transform", `translate(0,${marginTop})`)
        .call(axisTop(x).ticks(width / 80))
        .call(g => g.select(".domain").remove());

    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(axisLeft(y).tickSizeOuter(0))
        .append("text")
        .attr("x", 2)
        .attr("y", marginBottom - 10) // Adjust the position of the label
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text("Milestones");

    // X-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .text("Students Participating");

    return svg.node();
}

export { createBarChart };