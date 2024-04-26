async function createBarChart(data) {
    // Sort the data based on milestone_index in ascending order
    data.sort((a, b) => a.milestone_index - b.milestone_index);

    const barHeight = 100;
    const marginTop = 0;
    const marginRight = 30;
    const marginBottom = 55;
    const marginLeft = 150;
    const width = 1500;
    const height = 600;

    // Create the scales.
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => parseInt(d.total_entries))])
        .range([marginLeft, width - marginRight]);

    const y = d3.scaleBand()
        .domain(data.map(d => d.milestone_index))
        .rangeRound([marginTop, height - marginBottom])
        .padding(0.1);

    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 25px sans-serif;");

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
        .attr("transform", `translate(0,${height-marginBottom})`)
        .call(d3.axisBottom(x).ticks(width / 80))
        .call(g => g.select(".domain").remove());

    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).tickSizeOuter(0))

    svg.append("text")
        .attr("x", 0)
        .attr("y", height/2)
        .attr("fill", "#000")
        .text("Milestones");

    // X-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height-10)
        .attr("text-anchor", "middle")
        .text("Students Participating");

    svg.selectAll("text")
        .attr("font-site", "50px")
        .attr("fill", "#000")
        .attr("font-weight", "bold")

    return svg.node();
}