// https://observablehq.com/@lauraarago/task-of-week-3-29th-october-4th-november

async function createMultiLineChart(data){
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height);

    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);


    svg.selectAll('.line')
        .data(data)
        .join('path')
        .attr("class", "line")
        .attr("d", d => mlines(d[1]))
        .attr("stroke", d => colorScale(d[0]))
        .style("fill", "none")
        .style("stroke-width", 2);

    let legend = svg.selectAll(".legend")
        .data(data)
        .enter();

    legend
        .append('text')
        .text(d => d[0])
        .attr('x', legendOrigin[0] + labelHeight * 1.2)
        .attr('y', (d,i) => legendOrigin[1] + labelHeight + labelHeight * 1.2 *i)
        .style('font-family', 'sans-serif')
        .style('font-size', `${labelHeight-3}px`)
        .style('fill', 'grey');


    legend
        .append('rect')
        .attr('x', legendOrigin[0])
        .attr('y', (d,i) => legendOrigin[1] + labelHeight * 1.2 * i)
        .attr('width', labelHeight)
        .attr('height', labelHeight)
        .attr('fill', d => colorScale(d[0]))
        .attr("fill-opacity","0.7")
        .attr('stroke', d => colorScale(d[0]))
        .style('stroke-width', '1px');

    return svg.node();
}