participants_data = []
grouped_data = [] //according to household size and education level 
data = []
filteredData = [] //according to age groups
allAgeGroups = ["18-24", "25-30", "31-38", "38-45", "45-52", "52-60", "Unknown"];
allEducationLevels = ["Low", "HighSchoolOrCollege", "Bachelors", "Graduate"]
let svg, xScale, yScale, xAxis, yAxis, height, colorScale;
var tooltip;

document.addEventListener('DOMContentLoaded', function () {

    Promise.all([d3.csv('preprocessed_data/Participants.csv')])
        .then(function (values) {

            participants_data = values[0];

            participants_data.forEach(function (d) {
                d.householdSize = +d.householdSize
            });
            filteredData = participants_data
            grouped_data = d3.group(participants_data, d => d.householdSize, d => d.educationLevel);

            householdSizes = Array.from(grouped_data.keys())
            educationLevels = Array.from(grouped_data.get(householdSizes[0]).keys())
            educationTotals = {};

            participants_data.forEach(function (d) {
                if (educationTotals[d.educationLevel]) {
                    educationTotals[d.educationLevel] += 1
                }
                else {
                    educationTotals[d.educationLevel] = 1
                }
            })

            for(let i = 0; i < householdSizes.length; i++){
                for(let j = 0; j < educationLevels.length; j++){
                    data.push({
                        "householdSize": householdSizes[i],
                        "educationLevel": educationLevels[j],
                        "educationLevel": educationLevels[j],
                        "participantPercentage": grouped_data.get(householdSizes[i]).get(educationLevels[j]).length/educationTotals[educationLevels[j]]*100,
                        "participantFrequency": grouped_data.get(householdSizes[i]).get(educationLevels[j]).length
                    })  
                }
            }
            createBubbleChart();
        });
});

function getAgeGroup(age) {
    if (age >= 18 && age <= 24) {
        return "18-24";
    } else if (age >= 25 && age <= 31) {
        return "25-31";
    } else if (age >= 32 && age <= 38) {
        return "32-38";
    } else if (age >= 39 && age <= 45) {
        return "39-45";
    } else if (age >= 46 && age <= 52) {
        return "46-52";
    } else if (age >= 53 && age <= 60) {
        return "53-60";
    } else {
        return "Unknown";
    }
}

function filterData(selectedAgeGroups,selectedEducationLevels) {
    filteredData = []
    data = []
    participants_data.forEach(function (d) {
        d.householdSize = +d.householdSize
        if (selectedAgeGroups.includes(getAgeGroup(d.age)) && selectedEducationLevels.includes(d.educationLevel)){
            filteredData.push(d)
        }
    });
    grouped_data = d3.group(filteredData, d => d.householdSize, d => d.educationLevel);

    householdSizes = Array.from(grouped_data.keys())
    educationLevels = Array.from(grouped_data.get(householdSizes[0]).keys())
    educationTotals = {};

    filteredData.forEach(function (d) {
        if (educationTotals[d.educationLevel]) {
            educationTotals[d.educationLevel] += 1
        }
        else {
            educationTotals[d.educationLevel] = 1
        }
    })

    for(let i = 0; i < householdSizes.length; i++){
        for(let j = 0; j < educationLevels.length; j++){
            data.push({
                "householdSize": householdSizes[i],
                "educationLevel": educationLevels[j],
                "participantPercentage": grouped_data.get(householdSizes[i]).get(educationLevels[j]).length/educationTotals[educationLevels[j]]*100,
                "participantFrequency": grouped_data.get(householdSizes[i]).get(educationLevels[j]).length
            })  
            }
    }
    updateBubbleChart()
}

function createBubbleChart() {
    margin = { top: 20, right: 20, bottom: 40, left: 20 };
    width = 700 - margin.left - margin.right;
    height = 500 - margin.top - margin.bottom;

    svg = d3.select("#bubbleChart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    xScale = d3.scaleBand()
        .domain(allEducationLevels.sort((a, b) => allEducationLevels.indexOf(a[0]) - allEducationLevels.indexOf(b[0])))
        .range([margin.left, margin.left+width]);

    yScale = d3.scaleBand()
        .domain([1,2,3])
        .range([height, 0]);

    radiusScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.participantPercentage), d3.max(data, d => d.participantPercentage)])
        .range([20, 60]); 

    colorScale = d3.scaleOrdinal()
    .domain(allEducationLevels)
    .range(["#4e79a7","#f28e2c","#e15759","#76b7b2"]);


    tooltip = d3.select("#tooltip");

    xAxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    yAxis = svg.append("g")
        .attr("transform", "translate("+margin.left+",0)")
        .call(d3.axisLeft(yScale));

    svg.append("text")
        .attr("transform", "translate(" + (width / 2 + margin.left + margin.right) + " ," + (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("Education Level");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left-40)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Household Size");

    updateBubbleChart()
}
function createLineChart() {
    const averageHouseholdSize = d3.rollup(
        filteredData,
        v => d3.mean(v, d => d.householdSize),
        d => d.educationLevel
        );
 
    const sortedAverageData = Array.from(averageHouseholdSize)
        .sort((a, b) => allEducationLevels.indexOf(a[0]) - allEducationLevels.indexOf(b[0]));
    
    const yScaleAvgHouseholdSize = d3.scaleLinear()
    .domain([1, 3])
    .range([height, 0]);

    const line = d3.line()
    .x(d => xScale(d[0]) + xScale.bandwidth() / 2)
    .y(d => yScaleAvgHouseholdSize(d[1]));

    svg.append("path")
    .datum(sortedAverageData)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("d", line)
    .attr("class","line-path")
    .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke-width", 4);

        svg.selectAll(".avgHouseholdTooltip").transition()
            .duration(200)
            .style("opacity", 1);
    })
    .on("mouseout", function () {
        d3.select(this).attr("stroke-width", 2);

        svg.selectAll(".avgHouseholdTooltip").transition()
            .duration(200)
            .style("opacity", 0);
    });

    const tooltips = svg.selectAll(".tooltip-line")
        .data(sortedAverageData)
        .enter().append("g")
        .attr("class", "tooltip-line")
        .style("display", "block");

    tooltips.append("rect")
        .attr("x", d => xScale(d[0]) + xScale.bandwidth() / 2 - 50)
        .attr("y", d => yScaleAvgHouseholdSize(d[1]) - 25)
        .attr("class", "avgHouseholdTooltip")
        .attr("width", 100)
        .attr("height", 20)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("rx", 5)
        .attr("z", 100000)
        .attr("opacity", 0);

    tooltips.append("text")
        .attr("x", d => xScale(d[0]) + xScale.bandwidth() / 2)
        .attr("y", d => yScaleAvgHouseholdSize(d[1]) - 15)
        .attr("class", "avgHouseholdTooltip")
        .attr("opacity", 0)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .text(d => d3.format(".2f")(d[1]));
    
    tooltips.append("circle")
        .attr("cx", d => xScale(d[0]) + xScale.bandwidth() / 2)
        .attr("cy", d => yScaleAvgHouseholdSize(d[1]))
        .attr("r", 4)
        .attr("fill", "black")
        .attr("stroke", "grey")
        .attr("stroke-width", 2);
}

function updateBubbleChart(){    
    xScale.domain(Array.from(new Set(data.map(d => d.educationLevel))).sort((a, b) => allEducationLevels.indexOf(a) - allEducationLevels.indexOf(b)));
    
    radiusScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.participantPercentage), d3.max(data, d => d.participantPercentage)])
        .range([20, 60]); 

    xAxis.transition()
        .duration(500)
        .call(d3.axisBottom(xScale));


    circle = svg.selectAll(".circle")
        .data(data, d => d.educationLevel)
        .join(
            enter => enter.append("circle")
                .attr("class","circle")
                .attr("cx", d => xScale(d.educationLevel) + xScale.bandwidth() / 2)
                .attr("cy", d => yScale(d.householdSize) + yScale.bandwidth() / 2)
                .attr("r",  d => radiusScale(d.participantPercentage))
                .attr("fill", d => colorScale(d.educationLevel))
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .on("mouseover", function (event, d) {
                    d3.select(this).attr("opacity", 0.7);
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                    tooltip.html(`Participants percentage per<br>household size: ${d3.format(".2f")(d.participantPercentage)}%<br><br>Number of participants: ${d.participantFrequency}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px")
                        .style("font-size", "12px");
                })
                .on("mousemove", function (event, d) {
                    tooltip.style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function () {
                    d3.select(this).attr("opacity", 1);
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0);
                }),
            update => update
                .call(update => update.transition().duration(500)
                .attr("cx", d => xScale(d.educationLevel) + xScale.bandwidth() / 2)
                .attr("cy", d => yScale(d.householdSize) + yScale.bandwidth() / 2)
                .attr("r",  d => radiusScale(d.participantPercentage))
                .attr("fill", d => colorScale(d.educationLevel))
                .attr("stroke", "black")
                .attr("stroke-width", 1)),
            exit => exit.transition().duration(200).remove()
        ); 

    updateLineChart()
}

function updateLineChart(){
    svg.selectAll(".line-path").remove();
    svg.selectAll(".tooltip-line").remove();
    createLineChart();
}
