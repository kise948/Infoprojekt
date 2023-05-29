function main(){
    let d3 = require("d3")
    let labwork = require("../json files/labwork.json")
    let courses = require("../json files/courses.json")
    let degrees = require("../json files/degrees.json")
    let repCardEntry = require("../json files/REPORT_CARD_ENTRY.json")
    let repCardEntryType = require("../json files/REPORT_CARD_ENTRY_TYPE.json")

    let milestones = new Map()

    // Via rest interface, get the count of people that attempted each milestone for a labwork
    //simulated here with getting the count of people
    for (let entry in repCardEntry){
        if(entry.LABWORK === "ef693956-6b7a-4731-8d89-f86aff0f14a8"){ //looking for ALL PP - AI associated report card entries
            let label = entry.LABEL
            if (milestones.has(label)){
                milestones.set(label, milestones.get(label) + 1)
            } else {
                milestones.set(label, 1)
            }
        }
    }


    const width = 800
    const height = 400
    const margin = {top: 50, bottom: 50, left: 50, right: 50}
    const svg = d3.select('#d3-container')
        .append('svg')
        .attr('height', height - margin.top - margin.bottom)
        .attr('width', width - margin.left - margin.right)
        .attr('viewBox', [0, 0, width, height])
}