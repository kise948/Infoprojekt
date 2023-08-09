function main(){
    import("d3")

    console.log("Starting")
    //getting example data
    let labwork = require("../json files/labwork.json")
    let courses = require("../json files/courses.json")
    let degrees = require("../json files/degrees.json")
    let repCardEntry = require("../json files/REPORT_CARD_ENTRY.json")
    let repCardEntryType = require("../json files/REPORT_CARD_ENTRY_TYPE.json")

    //let milestones = new Map()
    let milestones = []

    // Through the API get a json array containing all entries for a given year and labwork
    for (let entry in repCardEntry){ //
        if(entry.LABWORK === "ef693956-6b7a-4731-8d89-f86aff0f14a8"){ //looking for ALL PP - AI associated report card entries
            let index = entry.ASSIGNMENT_INDEX
            while(typeof milestones[index] === 'undefined'){
                milestones.push({label: null, participants: null})
            }
            if(milestones[index].label === null){
                milestones[index] = {label: entry.LABEL, participants: 1}
            } else {milestones[index].participants++}
        }
    }
    console.log(JSON.stringify(milestones))
    console.log("Finished")

/*
    const width = 800
    const height = 400
    const margin = {top: 50, bottom: 50, left: 50, right: 50}
    const svg = d3.select('#d3-container')
        .append('svg')
        .attr('height', height - margin.top - margin.bottom)
        .attr('width', width - margin.left - margin.right)
        .attr('viewBox', [0, 0, width, height])

    const x = d3.scaleBand()
        .domain(d3.range(milestones.size))
        .range([margin.left, width - margin.right])
        .padding(0.1)

    const y = d3.scaleLinear()
        .domain([0, Math.max(...milestones.values())])
        .range([height - margin.bottom, margin.top])

    svg
        .append('g')
        .attr('fill', 'blue')
        .selectAll('rect')
        .data(milestones)
        .join('rect')
            .attr('x', (d) => x(d.index))
            .attr('y', (d) => y(d.value))
            .attr('width', x.bandwidth())
            .attr('height', d => y(0) - y(d.value))

    function xAxis(g){
        g.attr('transform', `translate(0, ${height - margin.bottom})`)
        g.call(d3.axisBottom(x).tickFormat(i => milestones.get(i)))
    }

    svg.node()*/
}

main()