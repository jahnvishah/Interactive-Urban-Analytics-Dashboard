
let networkData;
let participants;
let ageSelected = true;
let selectedAgeGroups
let selectedEducationLevels
let participantTimelineId = null

    // ["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"]
const educationColorScale = d3.scaleOrdinal()
    .domain(['Graduate','Bachelors', 'HighSchoolOrCollege', 'Low'])
    .range(["#4e79a7","#f28e2c","#e15759","#76b7b2"]);

    const ageColorScale = d3.scaleOrdinal()
    .domain(['18-24', '25-31', '32-38', '39-45', '46-52', '53-60'])
    .range(["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949"]);

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
document.addEventListener('DOMContentLoaded', function () {
  Promise.all([
    d3.csv('preprocessed_data/processedSocialNetwork.csv'),
    d3.csv('preprocessed_data/participants.csv')
  ]).then(function (values) {
    networkData = values[0];
    participants = values[1].reduce((acc, p) => {
      acc[p.participantId] = p;
      return acc;
    }, {});
    updateTimeSeriesGraph(); // Call to update the console log
  });
});


async function filterData(sentSelectedAgeGroups, sentSelectedEducationLevels){
  selectedAgeGroups = sentSelectedAgeGroups
  selectedEducationLevels = sentSelectedEducationLevels
  let filteredData;
  if (participantTimelineId != null) {
    filteredData = networkData.filter(d => d.participantIdFrom == participantTimelineId ).map(d => {
      const participantInfo = participants[d.participantIdFrom];
      const ageGroup = getAgeGroup(participantInfo.age);
      const educationLevel = participantInfo.educationLevel;
  
      return {
        date: d.timestamp.split(' ')[0], // Extract the date
        participantIdFrom: d.participantIdFrom,
        classification: ageSelected ? ageGroup : educationLevel,
        timestamp: d.timestamp, // Keep the original timestamp
        ageGroup: ageGroup,
        educationLevel: educationLevel
      };
    });;
  } else {
    // console.log("HERE");
    filteredData = networkData.filter(d => d.timestamp != null ).map(d => {
      const participantInfo = participants[d.participantIdFrom];
      const ageGroup = getAgeGroup(participantInfo.age);
      const educationLevel = participantInfo.educationLevel;
  
      return {
        date: d.timestamp.split(' ')[0], // Extract the date
        participantIdFrom: d.participantIdFrom,
        classification: ageSelected ? ageGroup : educationLevel,
        timestamp: d.timestamp, // Keep the original timestamp
        ageGroup: ageGroup,
        educationLevel: educationLevel
      };
    });;
  }
  filteredData
      // console.log(filteredData)

  return filteredData
}

async function aggregateData(filteredData, sentSelectedAgeGroups, sentSelectedEducationLevels) {
  let aggregation = {};
  selectedAgeGroups = sentSelectedAgeGroups;
  selectedEducationLevels = sentSelectedEducationLevels;
  filteredData.forEach(d => {
    const classification = d.classification;
    const date = d.date; // Use date instead of timestamp
    if (!aggregation[classification]) {
      aggregation[classification] = {};
      // console.log(aggregation[classification])
    }
    if (!aggregation[classification][date]) {
      aggregation[classification][date] = 0;
    }
    aggregation[classification][date]++;
  });
  // console.log(aggregation)
  if(selectedAgeGroups != null && selectedEducationLevels != null)
  {aggregation = Object.fromEntries(
    (Object.entries(aggregation).filter(([key, value]) => selectedAgeGroups.includes(key) || selectedEducationLevels.includes(key))
    ));
  
  }
  return aggregation;
}

function addLegend() {
  const svg = d3.select("#timeLine-svg");

  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(80, 20)"); // Adjust the translate values as needed

  const legendItems = ageSelected? ageColorScale.domain() : educationColorScale.domain();
  const legendRange = ageSelected? ageColorScale.range() : educationColorScale.range();

  const legendRectSize = 18;
  const legendSpacing = 4;

  const legendColor = legend.selectAll(".legendColor")
    .data(legendRange)
    .enter().append("g")
    .attr("class", "legendColor")
    .attr("transform", (d, i) => `translate(0, ${i * (legendRectSize + legendSpacing)})`);

  legendColor.append("rect")
    .attr("width", legendRectSize)
    .attr("height", legendRectSize)
    .style("fill", d => d);

  legendColor.append("text")
    .attr("x", legendRectSize + legendSpacing)
    .attr("y", legendRectSize - legendSpacing)
    .text((d, i) => legendItems[i] + (ageSelected? " years": ""))
    .attr('fill', 'black');
}

async function updateTimeSeriesGraph(selectedAgeGroups, selectedEducationLevels) {
  // console.log("Updating Time Series Graph");
  let filteredData = await filterData()
  // console.log(filteredData)
  let aggregatedData = await aggregateData(filteredData, selectedAgeGroups, selectedEducationLevels);
  // Clear existing graph
  d3.select("#timeLine-svg").selectAll("*").remove();

  // Inside updateTimeSeriesGraph function
d3.select("#legend").html(""); // Clear existing legend

const currentColorScale = ageSelected ? ageColorScale : educationColorScale;
const currentLabels = ageSelected ? ageColorScale.domain() : educationColorScale.domain();
addLegend();


  // Set dimensions and margins
  const margin = { top: 10, right: 30, bottom: 30, left: 60 },
        width = 1400 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

  // Create a tooltip
var tooltip = d3.select("#tooltip")
.style("opacity", 0);

// Three function that change the tooltip when user hover / move / leave a cell
var mouseover = function(event, d) {
  tooltip
    .style("opacity", 1);
  d3.select(this)
    .style("stroke", "gray")
    .style("opacity", 1);
}

var mousemove = function(event, data) {
  var mouseDate = xScale.invert(d3.pointer(event, this)[0]);
  var i = d3.bisector(function(d) { return d.date; }).left(data.values, mouseDate, 1);
  var selectedData = data.values[i];
  let a = ageSelected? "years":""
  let b = participantTimelineId? "Particiant:" + participantTimelineId + "<br>" : ""
  tooltip
    .html(b+"Category: " + data.name + a +"<br/>" + "Date: " + d3.timeFormat("%Y-%m-%d")(selectedData.date) + "<br/>" + "Intensity: " + selectedData.count)
    .style("left", (event.pageX + 10) + "px")
    .style("top", (event.pageY - 15) + "px");
}

var mouseleave = function(event, d) {
  tooltip
    .style("opacity", 0);
  d3.select(this)
    .style("stroke", currentColorScale(d.name))
    .style("opacity", 0.8);
}


  // Append SVG object
  const svg = d3.select("#timeLine-svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Set up scales
  const xScale = d3.scaleTime()
    .range([0, width]);
  
  const yScale = d3.scaleLinear()
    .range([height, 0]);

  // Prepare data for line chart
  let dataReady = Object.entries(aggregatedData).map(([key, values]) => {
    let reformattedValues = Object.entries(values).map(([date, count]) => {
      return { date: d3.timeParse("%Y-%m-%d")(date), count };
    });

    return { name: key, values: reformattedValues };
  });

  // Define domain for the scales
  xScale.domain(d3.extent(dataReady.flatMap(d => d.values), d => d.date));
  yScale.domain([0, d3.max(dataReady.flatMap(d => d.values), d => d.count)]);

  // Add the X Axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .style("fill", "black");

  // Add the Y Axis
// Add the Y Axis
svg.append("g")
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    .style("fill", "black");

// Add Y-axis label
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Social Activity Intensity")
    .style("fill", "Black");

    svg.append("text")
    .attr("transform", `translate(${width / 2},${height + margin.top + 20})`) // Adjust the position as needed
    .style("text-anchor", "middle")
    .style("fill", "black")
    .text("Date");

  // Draw the line
  svg.selectAll(".line")
  .data(dataReady)
  .enter()
  .append("path")
    .attr("fill", "none")
    .attr("stroke", (d, i) => currentColorScale(d.name))
    .attr("stroke-width", 3)
    .attr("d", d => d3.line()
      .x(D => xScale(D.date))
      .y(D => yScale(D.count))
      (d.values))
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);

}



function onSelectionChange(selectedValue) {
  
  ageSelected = selectedValue
  updateTimeSeriesGraph();
}

function participantTimeline(show, participantId){
  if(show){
    // console.log("Show timeline for participant: ", participantId)
    participantTimelineId = participantId;
    updateTimeSeriesGraph(selectedAgeGroups, selectedEducationLevels)


  } else {
    participantTimelineId = null
    updateTimeSeriesGraph(selectedAgeGroups, selectedEducationLevels)
  }
}