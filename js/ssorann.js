const margin = { top: 20, right: 30, bottom: 40, left: 50 };
const width = 650 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;
let svg, xScale, yScale, colorScale;
let xAxis, yAxis;
const educationLevels = ["Low", "HighSchoolOrCollege", "Bachelors", "Graduate"];
let participantData;
let tooltip;
let filteredData;

document.addEventListener("DOMContentLoaded", function () {

    d3.csv("./preprocessed_data/ssorann-bar.csv").then(function (data) {
        data.forEach(function (d) {
            d.participantId = +d.participantId;
            d.householdSize = +d.householdSize;
            d.haveKids = d.haveKids === "TRUE";
            d.age = +d.age;
            d.joviality = +d.joviality;
        });

        data.forEach(function (d) {
            d.ageGroup = getAgeGroup(d.age);
        });
        participantData = data
        filteredData = participantData
        createBaseChart();
        createLineChart();
        updateLineChart();
    });

});

function filterData(selectedAgeGroups, selectedEducationLevels) {
    // const ageGroupCheckboxes = document.querySelectorAll('input[name="ageGroup"]:checked');
    // const educationLevelCheckboxes = document.querySelectorAll('input[name="educationLevel"]:checked');

    // const selectedAgeGroups = Array.from(ageGroupCheckboxes).map(checkbox => checkbox.value);
    // const selectedEducationLevels = Array.from(educationLevelCheckboxes).map(checkbox => checkbox.value);

    filteredData = participantData.filter(participant => {
        return (
            selectedAgeGroups.includes(participant.ageGroup) &&
            selectedEducationLevels.includes(participant.educationLevel)
        );
    });
    updateBarChart();

}



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
let groupedData;
function createBaseChart() {
    groupedData = d3.group(participantData, d => d.ageGroup);

    const aggregatedData = Array.from(groupedData, ([ageGroup, groupData]) => {
        const counts = educationLevels.reduce((acc, level) => {
            acc[level] = d3.sum(groupData, d => (d.educationLevel === level) ? 1 : 0);
            return acc;
        }, {});

        return { ageGroup, ...counts };
    });

    stackedData = d3.stack().keys(educationLevels)(aggregatedData);
    stackedData.map((d, i) => {
        d.map(d => {
            d.key = educationLevels[i]
            return d
        })
        return d
    })

    svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    xScale = d3.scaleBand()
        .domain(participantData.map(d => d.ageGroup).sort((a, b) => {
            const aRange = a.split('-').map(Number);
            const bRange = b.split('-').map(Number);
            return aRange[0] - bRange[0];
        }))
        .range([0, width])
        .padding(0.1);

    const maxYValue = d3.max(stackedData[stackedData.length - 1], d => d[1]);

    yScale = d3.scaleLinear()
        .domain([0, maxYValue])
        .range([height, 0]);

    xAxis = svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    yAxis = svg.append("g")
        .attr("class", "y-axis-left")
        .call(d3.axisLeft(yScale));

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.top + 15)
        .style("text-anchor", "middle")
        .text("Age Groups");

    svg.append("text")
        .attr("class", "y-axis-left-label")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - height / 2)
        .attr("y", 0 - margin.left)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Participant Count");

    colorScale = d3.scaleOrdinal()
        .domain(educationLevels)
        .range(["#4e79a7","#f28e2c","#e15759","#76b7b2"]);




    tooltip = d3.select(".tooltip")

    updateBarChart();
}

function updateBarChart() {
    groupedData = d3.group(filteredData, d => d.ageGroup);

    const aggregatedData = Array.from(groupedData, ([ageGroup, groupData]) => {
        const counts = educationLevels.reduce((acc, level) => {
            acc[level] = d3.sum(groupData, d => (d.educationLevel === level) ? 1 : 0);
            return acc;
        }, {});

        return { ageGroup, ...counts };
    });

    stackedData = d3.stack().keys(educationLevels)(aggregatedData);
    stackedData.map((d, i) => {
        d.map(d => {
            d.key = educationLevels[i]
            return d
        })
        return d
    })

    xScale.domain(filteredData.map(d => d.ageGroup).sort((a, b) => {
        const aRange = a.split('-').map(Number);
        const bRange = b.split('-').map(Number);
        return aRange[0] - bRange[0];
    }));

    const maxYValue = d3.max(stackedData[stackedData.length - 1], d => d[1]);

    yScale.domain([0, maxYValue]);

    xAxis
        .transition()
        .duration(500)
        .call(d3.axisBottom(xScale));

    yAxis
        .transition()
        .duration(500)
        .call(d3.axisLeft(yScale));

    svg.selectAll(".bar-group")
        .data(stackedData)
        .join("g")
        .attr("class", "bar-group")
        .attr("fill", d => colorScale(d.key))
        .selectAll("rect")
        .data(d => d, d => d.data.ageGroup)
        .join(
            enter => enter.append("rect")
                .attr("x", d => xScale(d.data.ageGroup))
                .attr("y", d => yScale(d[1]))
                .attr("height", d => yScale(d[0]) - yScale(d[1]))
                .attr("width", xScale.bandwidth())
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .on("mouseover", function (event, d) {
                    const totalParticipants = d.data[d.key];
                    const ageGroup = d.data.ageGroup;
                    const educationLevel = d.key;

                    d3.select(this)
                        .attr("opacity", 1)
                        .style("cursor", "pointer");

                    svg.selectAll(".bar-group")
                        .filter(barGroup => barGroup.key !== d.key)
                        .selectAll("rect")
                        .attr("opacity", 0.5);

                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0.9);

                    tooltip.html(`Age Group: ${ageGroup}<br>Education Level: ${educationLevel}<br>Participants: ${totalParticipants}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px")
                        .style("font-size", "12px");
                })
                .on("mousemove", function (event, d) {
                    tooltip.style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function () {
                    svg.selectAll(".bar-group")
                        .selectAll("rect")
                        .attr("opacity", 1);

                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0);
                })
                .on("click", function (event, d) {
                    const totalParticipants = d.data[d.key];
                    const ageGroup = d.data.ageGroup;
                    const educationLevel = d.key;
                    handleTooltipClick(ageGroup, educationLevel, totalParticipants);
                }),
            update => update
                .call(update => update.transition().duration(500)
                    .attr("x", d => xScale(d.data.ageGroup))
                    .attr("y", d => yScale(d[1]))
                    .attr("height", d => yScale(d[0]) - yScale(d[1]))
                    .attr("width", xScale.bandwidth())),
            exit => exit.transition().duration(200).remove()
        );
    svg.selectAll(".cross-icon")
        .data(filteredData, d => d.ageGroup)
        .join(
            enter => enter.append("text")
                .attr("class", "cross-icon")
                .attr("font-family", "FontAwesome")
                .attr("fill", "red")
                .attr("text-anchor", "middle")
                .attr("y", d => yScale(d3.max(stackedData, stack => stack.find(item => item.data.ageGroup === d.ageGroup)[1])) - 5)
                .attr("x", d => xScale(d.ageGroup) + xScale.bandwidth() / 2)
                .text("\uf00d") // Unicode for cross icon
                .style("cursor", "pointer")
                .on("click", function (event, d) {
                    const ageGroup = d.ageGroup;
                    handleCrossIconClick(ageGroup);
                }),
            update => update.transition().duration(500)
                .attr("x", d => xScale(d.ageGroup) + xScale.bandwidth() / 2)
                .attr("y", d => yScale(d3.max(stackedData, stack => stack.find(item => item.data.ageGroup === d.ageGroup)[1])) - 5)
                .attr("fill", "red")
                .text("\uf00d"),
            exit => exit.transition().duration(200).remove()
        );
    updateLineChart();
}

function handleCrossIconClick(ageGroup) {
    const parentDocument = window.parent.document;
    const ageGroupCheckboxes = parentDocument.querySelectorAll('input[name="ageGroup"]');
    let check = null;
    ageGroupCheckboxes.forEach(checkbox => {
        check = checkbox
        if (checkbox.value === ageGroup) {
            checkbox.checked = false;
        }
    });
    check.dispatchEvent(new Event('change', { bubbles: true }));
}

function handleTooltipClick(ageGroup, educationLevel, totalParticipants) {
    const parentDocument = window.parent.document;
    const educationLevelCheckboxes = parentDocument.querySelectorAll('input[name="educationLevel"]');
    let check = null;
    let count = 0;
    educationLevelCheckboxes.forEach(checkbox => {
        check = checkbox;
        if (checkbox.checked) {
            count++;
        }
        if (checkbox.value === educationLevel) {
            checkbox.checked = true;
        } else {
            checkbox.checked = false;
        }
    });
    if (count == 1) {
        educationLevelCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
    }
    check.dispatchEvent(new Event('change', { bubbles: true }));
}

function createLineChart() {
    const averageJoviality = Array.from(groupedData, ([ageGroup, groupData]) => {
        const avgJoviality = d3.mean(groupData, d => d.joviality);
        return { ageGroup, avgJoviality };
    });

    averageJoviality.sort((a, b) => {
        const aRange = a.ageGroup.split('-').map(Number);
        const bRange = b.ageGroup.split('-').map(Number);
        return aRange[0] - bRange[0];
    });

    const line = d3.line()
        .x(d => xScale(d.ageGroup) + xScale.bandwidth() / 2)
        .y(d => yScaleJoviality(d.avgJoviality));

    const yScaleJoviality = d3.scaleLinear()
        .domain([0.3, d3.max(averageJoviality, d => d.avgJoviality) + 0.3])
        .range([height, 0]);

    svg.append("path")
        .datum(averageJoviality)
        .attr("fill", "none")
        .attr("class", "line-path")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 4)
        .attr("d", line)
        .on("mouseover", function (event, d) {
            d3.select(this).attr("stroke-width", 6);

            svg.selectAll(".bar-group rect").attr("opacity", 0.5);
            svg.select(".y-axis-left").attr("opacity", 0.5);
            svg.select(".y-axis-left-label").attr("opacity", 0.5);

            svg.selectAll(".jovialityTooltip").transition()
                .duration(200)
                .style("opacity", 1);

        })
        .on("mouseout", function () {
            d3.select(this).attr("stroke-width", 4);

            svg.selectAll(".bar-group rect").attr("opacity", 1);
            svg.select(".y-axis-left").attr("opacity", 1);
            svg.select(".y-axis-left-label").attr("opacity", 1);

            svg.selectAll(".jovialityTooltip").transition()
                .duration(200)
                .style("opacity", 0);
        });

    const tooltips = svg.selectAll(".tooltip-line")
        .data(averageJoviality)
        .enter().append("g")
        .attr("class", "tooltip-line")
        .style("display", "block");

    tooltips.append("rect")
        .attr("x", d => xScale(d.ageGroup) + xScale.bandwidth() / 2 - 25)
        .attr("y", d => yScaleJoviality(d.avgJoviality) - 25)
        .attr("class", "jovialityTooltip")
        .attr("width", 50)
        .attr("height", 20)
        .attr("fill", "white")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1)
        .attr("rx", 5)
        .attr("z", 100000)
        .attr("opacity", 0);

    tooltips.append("text")
        .attr("x", d => xScale(d.ageGroup) + xScale.bandwidth() / 2)
        .attr("y", d => yScaleJoviality(d.avgJoviality) - 15)
        .attr("class", "jovialityTooltip")
        .attr("opacity", 0)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .text(d => d3.format(".2f")(d.avgJoviality));

    tooltips.append("circle")
        .attr("cx", d => xScale(d.ageGroup) + xScale.bandwidth() / 2)
        .attr("cy", d => yScaleJoviality(d.avgJoviality))
        .attr("r", 4)
        .attr("fill", "steelblue")
        .attr("stroke", "white")
        .attr("stroke-width", 2);

    svg.append("g")
        .attr("class", "y-axis-right")
        .attr("transform", `translate(${width}, 0)`)
        .call(d3.axisRight(yScaleJoviality));



}

function updateLineChart() {
    svg.selectAll(".line-chart").remove();
    svg.selectAll(".tooltip-line").remove();
    svg.selectAll(".y-axis-right").remove();
    svg.selectAll(".legend").remove();
    svg.selectAll(".line-path").remove();
    createLineChart();
}



function getNearestAgeGroup(mouseX, averageJoviality) {
    const allAgeGroups = averageJoviality.map(d => xScale(d.ageGroup) + xScale.bandwidth() / 2);
    const index = d3.bisectLeft(allAgeGroups, mouseX);

    if (index === 0) {
        return averageJoviality[0].ageGroup;
    } else if (index === allAgeGroups.length) {
        return averageJoviality[allAgeGroups.length - 1].ageGroup;
    } else {
        const leftDistance = mouseX - allAgeGroups[index - 1];
        const rightDistance = allAgeGroups[index] - mouseX;

        return leftDistance < rightDistance ? averageJoviality[index - 1].ageGroup : averageJoviality[index].ageGroup;
    }
}
