let selectedDate = '2022-03-02'
let netwrokData
let checkinData
let filteredData
let participants
let kidsSelected
let ageSelected = true
let participantIdsWithKids
let participantIdsWithoutKids
let selectedAgeGroups
let selectedEducationLevels

const ageColorScale = d3.scaleOrdinal()
    .domain(['18-24', '25-31', '32-38', '39-45', '46-52', '53-60'])
    .range(["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949"]);

const educationColorScale = d3.scaleOrdinal()
.domain(['Graduate','Bachelors', 'HighSchoolOrCollege', 'Low'])
.range(["#4e79a7","#f28e2c","#e15759","#76b7b2"]);

function getAgeGroup(participantId) {
  let participant = participants[participantId];
  let age = participant.age
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
  Promise.all([d3.csv('preprocessed_data/processedSocialNetwork.csv'), d3.csv('preprocessed_data/participants.csv'),  d3.csv('preprocessed_data/processedCheckInJournal.csv')])
        .then(function (values) {
          netwrokData = values[0];
          participants = values[1];
          checkinData = values[2];
          participants.forEach(function (d) {
            d.participantId = +d.participantId;
            d.householdSize = +d.householdSize;
            d.haveKids = d.haveKids === "TRUE";
            d.age = +d.age;
            d.joviality = +d.joviality;
        });

        participants.forEach(function (d) {
            d.ageGroup = getAgeGroup(d.age);
        });
          participants = values[1];
          filterData();
          updateNetworkGraph();
       });
  });

function onSelectionChange(passedValue) {
    ageSelected = passedValue
    var apate162IFrame = document.getElementById('apate162');
    var classificationChangeFunction = apate162IFrame.contentWindow.onSelectionChange;
    classificationChangeFunction(ageSelected);
    updateNetworkGraph()

}

async function dateChanged(date){
  selectedDate = date;
  await filterData(selectedAgeGroups, selectedEducationLevels);
  await updateNetworkGraph();
}

async function filterData(sentSelectedAgeGroups, sentSelectedEducationLevels){
    selectedAgeGroups = sentSelectedAgeGroups
    selectedEducationLevels = sentSelectedEducationLevels
    let parsedDate = Date.parse(selectedDate); 
    filteredData = netwrokData.filter(d => {
      let timestamp = Date.parse(d.timestamp); 
      return timestamp === parsedDate;
    });
  if(selectedAgeGroups != null && selectedEducationLevels != null)
  {
    filteredData = filteredData.filter(e => {
      return (
          selectedAgeGroups.includes(participants[e.participantIdFrom].ageGroup) &&
          selectedEducationLevels.includes(participants[e.participantIdFrom].educationLevel)
      );
    });
    var apate162IFrame = document.getElementById('apate162');
    var updateTimeSeriesFunction = apate162IFrame.contentWindow.updateTimeSeriesGraph;
    updateTimeSeriesFunction(selectedAgeGroups, selectedEducationLevels);
  }
   
    updateNetworkGraph()
}

function getText(participantId) {
  // Format timestamp
  const tooltipText = `<div style="text-align:left">
    <c>Participant Information:
    </c><br>
    <i>Id:</i> <b>${participantId}</b><br>
    <i>haveKids:</i> <b>${participants[participantId].haveKids}</b><br>
    <i>age:</i> <b>${participants[participantId].age}</b><br>
    <i>educationLevel:</i> <b>${participants[participantId].educationLevel}</b><br>
    <i>joviality:</i> <b>${participants[participantId].joviality}</b>
  </div>`;
  // <i>interestGroup:</i> <b>${participants[participantId].interestGroup}</b><br>
  // <i>householdSize:</i> <b>${participants[participantId].householdSize}</b><br>

  return tooltipText;
}

function updateNetworkGraph(){
  const data = filteredData

  // Set up the SVG container
  const width = 1400;
  const height = 800;

  const svg = d3.select("#network-svg")

  svg.selectAll("*").remove(); // Clear old data


  var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);
    svg.append("svg")
    .attr("width", width)
    .attr("height", height);

  // Create a force simulation
  const simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(d => d.id))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX(width / 2).strength(0.15)) // Attraction towards the center along the x-axis
    .force("y", d3.forceY(height / 2).strength(0.15)) // Attraction towards the center along the y-axis
    .force("collide", d3.forceCollide(10).strength(0.8)) // Force to prevent node overlap


  // Create links and nodes
  const links = data.map(d => ({ source: d.participantIdFrom, target: d.participantIdTo }));
  const nodes = Array.from(new Set([...links.flatMap(d => [d.source, d.target])]))
  .map(id => ({ id }));

  // Add links and nodes to the simulation
  simulation.nodes(nodes).on("tick", update);
  simulation.force("link").links(links);

  // Create SVG elements for links and nodes
  const link = svg.selectAll(".link")
      .data(links)
      .enter().append("line")
      .attr("class", "link")
      .style("stroke", 'black');

    const node = svg.selectAll(".node")
      .data(nodes)
      .enter().append("circle")
      .attr("class", "node")
      .attr("r", 5)
      .style("fill", d => {return ageSelected? ageColorScale(getAgeGroup(d.id)): educationColorScale(participants[d.id].educationLevel)})
      .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended))
      .on("click", clicked)
      .on("mouseover", function(event,d) {
        div.transition()
          .duration(200)
          .style("opacity", 1);
        div.html(getText(d.id))
          .style("left", tooltipPosition(event).pageX + "px")
          .style("top", tooltipPosition(event).pageY + "px");
       })
      .on("mousemove", function (event) {
        div.style("left", tooltipPosition(event).pageX + "px")
          .style("top", tooltipPosition(event).pageY + "px");
      })
     .on("mouseout", function(d) {
        div.transition()
          .duration(500)
          .style("opacity", 0)});;


  // Add tooltips (optional)
  node.append("title").text(d => d.id);
  addLegend()
  function update() {
    link.attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node.attr("cx", d => d.x)
      .attr("cy", d => d.y);
  }
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  function addLegend() {
    const svg = d3.select("#network-svg");
  
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(20, 20)"); // Adjust the translate values as needed
  
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

  function tooltipPosition(e){
    pos = {
      pageX: e.pageX + 15,
      pageY: e.pageY - 40
    }
   return pos
  }

  function clicked(event, d) {
    const selectedNodeId = d.id;

    // Check if the node is already selected
    const isSelected = d3.select(this).attr("selected");
    sendDataToTimeline(isSelected, selectedNodeId)
    sendDataToMap(isSelected, selectedNodeId)
    // Toggle the selected state
    d3.select(this).attr("selected", isSelected ? null : true);

    // Set the opacity for filterData and links based on the selected state
    node.style("opacity", o => {
      if (isSelected) {
        return 1; // Regain original opacity for all nodes
      } else {
        return (o.id === selectedNodeId || areNodesConnected(selectedNodeId, o.id)) ? 1 : 0.2;
      }
    });

    link.style("opacity", o => {
      if (isSelected) {
        return 1; // Regain original opacity for all links
      } else {
        return (o.source.id === selectedNodeId || o.target.id === selectedNodeId) ? 1 : 0.2;
      }
    });
  }

  // Helper function to check if two nodes are connected
  function areNodesConnected(nodeId1, nodeId2) {
    return links.some(link => (link.source.id === nodeId1 && link.target.id === nodeId2) || (link.source.id === nodeId2 && link.target.id === nodeId1));
  }
}


async function sendDataToMap(isSelected, selectedNodeId){
  let parsedDate = Date.parse(selectedDate); 

  let filteredCheckInData = checkinData.filter(e => {
    let timestamp = Date.parse(e.timestamp);  
    return (e.participantId == selectedNodeId) && (timestamp >= parsedDate && timestamp < parsedDate + 24*60*60*1000);
  });
  const visitedPlaces = filteredCheckInData.map(obj => obj['venueId']);
  const data ={
    participantId: selectedNodeId,
    timestamp: selectedDate,
    visitedPlaces: visitedPlaces
  }
  let phablodiIframe = document.getElementById('pbhalodi');
  var plotParticipantSocialActivity = phablodiIframe.contentWindow.plotParticipantSocialActivity;
  plotParticipantSocialActivity(!isSelected, data);
}

function sendDataToTimeline(isSelected, participantId){
  let apate162IFrame = document.getElementById('apate162');
  var participantTimeline = apate162IFrame.contentWindow.participantTimeline;
  participantTimeline(!isSelected, participantId);
}