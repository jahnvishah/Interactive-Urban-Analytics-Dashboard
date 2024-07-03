// Donut and Pie
const originalData = [
    { "label": "Commercial", "value": 512 },
    { "label": "Residential", "value": 526 },
    { "label": "School", "value": 4 },
  ];

  const pubsAndRestaurantsData = [
    { "label": "Pubs", "value": 17 },
    { "label": "Restaurants", "value": 24 }
  ];

  const residentalData = [
    { "label": "0-5", "value": 158 },
    { "label": "6-10", "value": 173 },
    { "label": "11-15", "value": 95 },
    { "label": "16-20", "value": 35 },
    { "label": "21-25", "value": 4 },
    { "label": "26-30", "value": 3 }
  ];

  const schoolData = [
    { "label": "Schools", "value": 4 }
  ];

// Building type colors
var buildingColors = {
  "Commercial": "#4e79a7",
  "Residential": "#e15759",
  "School": "#f28e2c"
};

// Add legend for pubs, restaurants, and schools
var bubbleColors = {
  "Pubs": "#0CA6F5", // Light Blue
  "Restaurants": "#1175A8", // Dark Blue
  "Schools": "#DE970B" // Dark Yellow
};


const width = 500;
const height = 500;
const outerRadius = Math.min(width, height) / 2 - 40;
const donutWidth = 40; // Set the width of the donut
const innerRadius = outerRadius - donutWidth;

const originalArc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
const secondaryArc = d3.arc().innerRadius(0).outerRadius(140);
const pietooltip = d3.select("body").append("div")   
    .attr("class", "pietooltip")               
    .style("opacity", 0);

var buildings;

var buildingsSvg = d3.select("#chart");

function showPubs() {
  mapsSVG.selectAll(".Pubs").attr("opacity", 1); // Show pubs
  mapsSVG.selectAll(".Restaurants, .Schools").attr("opacity", 0); // Hide others
}
function showRestaurants() {
  mapsSVG.selectAll(".Restaurants").attr("opacity", 1); // Show restaurants
  mapsSVG.selectAll(".Pubs, .Schools").attr("opacity", 0); // Hide others
}

function showSchools() {
  mapsSVG.selectAll(".Schools").attr("opacity", 1); // Show schools
  mapsSVG.selectAll(".Pubs, .Restaurants").attr("opacity", 0); // Hide others
}

function showAll() {
  mapsSVG.selectAll(".Pubs, .Restaurants, .Schools").attr("opacity", 1);
}

const svg = d3.select("#originalChart")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + (width / 2 )+ "," + (height / 2 ) + ")");

const pie = d3.pie().value(d => d.value);
const color = d3.scaleOrdinal(d3.schemeCategory10);

function updateSecondaryChart(selectedCategory) {
  svg.selectAll(".secondaryChart").remove();

  const secondaryChart = svg.append("g")
    .attr("class", "secondaryChart")
    .attr("transform", "translate(0, 0)");

  let secondaryData;

  if (selectedCategory === "Commercial") {
    secondaryData = pubsAndRestaurantsData;
  } else if (selectedCategory === "Residential") {
    secondaryData = residentalData;
  }else if(selectedCategory == "School"){
	secondaryData = schoolData;
  }

  donutSlices = secondaryChart.selectAll("arc")
    .data(pie(secondaryData))
    .enter()
    .append("g")
    .on("click", function (d) {

      const label = d.srcElement.__data__.data.label;
      const val = d.srcElement.__data__.data.value
      const left = parseInt(label.split("-")[0]);
      const right = parseInt(label.split("-")[1]);

      var i = d.srcElement.__data__.index;
      
      if(i===0){
        i = 1;
      }else if(i===1){
        i = 0;
      }

      buildings.attr("opacity", function (d) {

        if(d.properties.maxOccupancy>left && d.properties.maxOccupancy<=right){
          return 1;
        }
        return 0.5;
  
      }).attr("fill",function (d) {

        // console.log(d);
        if(d.properties.maxOccupancy>left && d.properties.maxOccupancy<=right){
          return color(i);
        }
        

        return d.properties.buildingType===selectedCategory ? buildingColors[selectedCategory] : "White";
        
      });


      togglePieSelection(d,selectedCategory,buildings);
      
    });

  donutSlices.append("path")
    .attr("d", secondaryArc)
    .attr("fill", (d, i) => {

      if(selectedCategory!=="Residential"){
        return bubbleColors[d.data.label];
      }

      return color(i);
    });

    // console.log(selectedCategory);
    if(selectedCategory==="Residential"){

      // console.log(d.data.label);
      donutSlices.append("text")
      .attr("transform", d => {

        // console.log(d);
        return "translate(" + (secondaryArc.centroid(d)) + ")"
      })
      .attr("text-anchor", "middle")
      .text(d => {

        if(d.data.value>40)
          return d.data.label + ": " + d.data.value
      });
    }else{

      donutSlices.append("text")
      .attr("transform", d => {
        return "translate(" + (secondaryArc.centroid(d)) + ")"
      })
      .attr("text-anchor", "middle")
      .text(d => {
        return d.data.label + ": " + d.data.value
      });
    }
  
  donutSlices.on('mouseover', function(event,d) {

    d3.select(this).style("cursor", "pointer"); 

    pietooltip.style('opacity', 1);

        if(d.data.label!="Pubs" && d.data.label!="Restaurants" && d.data.label!="Schools" ){
            pietooltip.html("Max Occupancy : " +d.data.label+"<br> #Apartments : " + d.data.value)
            .style('left', (event.pageX) + 'px')
            .style('top', (event.pageY + 15) + 'px');
        }else{
          pietooltip.html(d.data.label+" : " + d.data.value)
            .style('left', (event.pageX) + 'px')
            .style('top', (event.pageY + 15) + 'px');
        }
    
})
.on("mousemove", function (event) {
  // Position tooltip

  var op = donutSlices.attr("opacity");

  if(op==0){
    d3.select(this).style("cursor", "default"); 
    pietooltip.style("opacity",0);
    return;
  }

  d3.select(this).style("cursor", "pointer"); 
  pietooltip.style("left", (event.pageX) + "px")
    .style("top", (event.pageY + 15) + "px");
})
.on('mouseout', function(d) {
    pietooltip.style('opacity', 0);
        // .duration(500)
        
});
}


// Add lines and labels
var lines = svg.selectAll(".line")
.data(pie(residentalData))
.enter()
.append("line")
.attr("class", "line")
.attr("x1", function(d) {
  var pos = secondaryArc.centroid(d);
  return pos[0]*2; // Adjust the line length
})
.attr("y1", function(d) {
  var pos = secondaryArc.centroid(d);
  return pos[1]*2; // Adjust the line length
})
.attr("x2", function(d) {
  var pos = secondaryArc.centroid(d);

  if(d.data.value===35){
    return pos[0]*2.2 - 15;
  }else if(d.data.value===4){
    return pos[0]-20;
  }else if(d.data.value===3)
    return pos[0] * 2.2 + 20; // Adjust the line length

  return pos[0]*2;
})
.attr("y2", function(d) {
  var pos = secondaryArc.centroid(d);

  if(d.data.value===35)
    return pos[1] * 2.1 + 5; 
  else if(d.data.value===4)
    return pos[1]*2.1;
  else if(d.data.value===3)
    return pos[1] * 2.1 - 5; // Adjust the line length

  return pos[1]*2; 
})
.style("stroke","#333")
.style("stroke-width","1")
.attr("fill","")
.style("opacity",(d) => {

  return 0;
});

var labels = svg.selectAll(".label")
.data(pie(residentalData))
.enter()
.append("text")
.attr("class", "label")
.attr("x", function(d) {
  var pos = secondaryArc.centroid(d);

  if(d.data.value===35){
    return pos[0]+15;
  }else if(d.data.value===4){
    return pos[0]*2.2-40;
  }
  return pos[0] * 2.2 + 10; 

  // return pos[0] *2.2 -50; // Adjust the label position
})
.attr("y", function(d) {
  var pos = secondaryArc.centroid(d);
  // return pos[1] *2.2; // Adjust the label position
  if(d.data.value===35)
    return pos[1] - 80; 
  else if(d.data.value===4)
    return pos[1] * 2.2 + 5; // Adjust the line length

  return pos[1]*2.1 - 6;
})
.attr("transform", function(d) {
  var pos = secondaryArc.centroid(d);
  var angle = 0;
  if(d.data.value===35){
    angle = Math.sin(pos[1]-200) * (180 / Math.PI);
  }
  return "rotate(" + angle + ")";
})
.text(function(d) {

  if(d.data.value<40)
    return d.data.label + " : " + d.data.value;
})
.style("font-size","12px")
.style("opacity",0);


const originalSlices = svg.selectAll("arc")
  .data(pie(originalData))
  .enter()
  .append("g")
  .on("click", function (d) {

    const selectedCategory = d.srcElement.__data__.data.label;

    buildings = buildingsSvg.selectAll("path");

    buildings.attr("fill", function (d){

      return buildingColors[d.properties.buildingType];
    });

    // Update the styles based on the selected category
    originalSlices.attr("opacity", function (d) {
      return (d.data.label === selectedCategory) ? 1 : 0.5;
    });

    //toggleArcSelection(d.srcElement.__data__);

    // Update the secondary chart based on the selected category
    updateSecondaryChart(selectedCategory);
    toggleArcSelection(d, buildings, selectedCategory);

  });

originalSlices.append("path")
  .attr("d", originalArc)
  .attr("fill", (d, i) => buildingColors[d.data.label]);

originalSlices.on('mouseover', function(event, d) {
  d3.select(this).style("cursor", "pointer"); 
  pietooltip.style('opacity', 1);
  pietooltip.html(d.data.label + ": " + d.data.value)
      .style('left', (event.pageX) + 'px')
      .style('top', (event.pageY + 15) + 'px');
})
.on("mousemove", function (event) {
  // Position tooltip

  d3.select(this).style("cursor", "pointer"); 
  pietooltip.style("left", (event.pageX) + "px")
    .style("top", (event.pageY + 15) + "px");
})
.on('mouseout', function(event, d) {
  pietooltip.style('opacity', 0);
      
});


//Add legends
var pielegend = svg.append("g")
.attr("transform", "translate(" + (-230) + ", "+(-225)+")");

pielegend.append("text")
.attr("font-weight", "bold")
.text("Business Type");

var pielegendItems = pielegend.selectAll(".pielegend-item")
.data(originalData.map(d => d.label))
.enter()
.append("g")
  .attr("class", "pielegend-item")
  .attr("transform", (d, i) => "translate(0," + (i * 15 + 10) + ")");

  pielegendItems.append("rect")
.attr("width", 10)
.attr("height", 10)
.attr('stroke', 'black')
.style("fill", d => buildingColors[d]);

pielegendItems.append("text")
.attr("x", 20)
.attr("y", 5)
.attr("dy", ".35em")
.text(d => d);




//Animation

const svgDefs = svg.append("defs");

const shadowFilter = svgDefs
  .append("filter")
  .attr("id", "drop-shadow")
  .attr("height", "130%"); // Adjust the height based on your preference

shadowFilter
  .append("feGaussianBlur")
  .attr("in", "SourceAlpha")
  .attr("stdDeviation", 5);

shadowFilter
  .append("feOffset")
  .attr("dx", 0)
  .attr("dy", 0)
  .attr("result", "offsetblur");

const feMerge = shadowFilter
  .append("feMerge");

feMerge
  .append("feMergeNode");

feMerge
  .append("feMergeNode")
  .attr("in", "SourceGraphic");


const selectedArcs = new Set();
const selectedPies = new Set();

//Toggle Functions
function toggleArcSelection(d,buildings,selectedCategory) {

  // const label = d.data.label;
  
  mapsSVG.selectAll(".Pubs").attr("opacity",0);
  mapsSVG.selectAll(".Restaurants").attr("opacity",0);
  mapsSVG.selectAll(".Schools").attr("opacity",0);

  buildings.attr("opacity",0.5);
  
  svg.selectAll(".line").style("opacity",0);
  svg.selectAll(".label").style("opacity",0);

  const newD = d.srcElement.__data__;

  const label = newD.data.label;

  if(selectedArcs.has(label)){
    selectedArcs.clear();

    originalSlices
    .attr("opacity", function (d) {
      return 1;
    })
    .attr("transform", function (d) {
      return `scale(1)`;
    })
    .attr("style","");

    // Update the styles based on the selected category
    buildings
      .attr("opacity", function (d) {
      return 0.5;
    });

    showAll();

    donutSlices.attr("opacity",0);
    svg.selectAll(".legend-secondary").remove();

    pietooltip.style("opacity",0);
    return;
  }

  // Clear the set of selected arcs
  selectedArcs.clear();

  // Add the newly clicked arc
  selectedArcs.add(label);

  // Update the styles based on the selected arcs
  originalSlices
    .attr("opacity", function (d) {
      return selectedArcs.size === 0 || selectedArcs.has(d.data.label) ? 1 : 0.5;
    })
    .attr("transform", function (d) {
      const isSelected = selectedArcs.has(d.data.label);
      const scale = isSelected ? 1.02 : 1; // You can adjust the scale factor
      return `scale(${scale})`;
    })
    .style("filter", function (d) {
      return selectedArcs.has(d.data.label) ? "url(#drop-shadow)" : "none";
    });

    buildings
    .attr("opacity", function (d) {
    return (d.properties.buildingType === selectedCategory) ? 1 : 0.5;
  })
  .attr("fill",function (d) {
    return (d.properties.buildingType === selectedCategory) ? buildingColors[selectedCategory] : "white";}
    );

  if(label==="Residential"){
    svg.selectAll(".line").style("opacity",1);
    svg.selectAll(".label").style("opacity",1);
  }
}


function togglePieSelection(d,selectedCategory,buildings) {


  mapsSVG.selectAll(".Pubs").attr("opacity",0);
  mapsSVG.selectAll(".Restaurants").attr("opacity",0);
  mapsSVG.selectAll(".Schools").attr("opacity",0);

  const newD = d.srcElement.__data__;

  const label = newD.data.label;

  if(selectedPies.has(label)){
    selectedPies.clear();

  donutSlices
    .attr("opacity", function (d) {
      return selectedPies.size === 0 || selectedPies.has(d.data.label) ? 1 : 0.5;
    })
    .attr("transform", function (d) {
      return `scale(1)`;
    })
    .attr("style", "");

    buildings
      .attr("opacity", function (d) {
      return (d.properties.buildingType === selectedCategory) ? 1 : 0.5;
    })
    .attr("fill",function (d) {
      return (d.properties.buildingType === selectedCategory) ? buildingColors[selectedCategory] : "white";
    });
    
    return;
  }

  selectedPies.clear();

  selectedPies.add(label);

  donutSlices
    .attr("opacity", function (d) {
      return selectedPies.size === 0 || selectedPies.has(d.data.label) ? 1 : 0.5;
    })
    .attr("transform", function (d) {
      const isSelected = selectedPies.has(d.data.label);
      const scale = isSelected ? 1.02 : 1; // You can adjust the scale factor
      return `scale(${scale})`;
    })
    .style("filter", function (d) {
      return selectedPies.has(d.data.label) ? "url(#drop-shadow)" : "none";
    });

    if(selectedCategory !== "Residential")
      mapsSVG.selectAll("."+label).attr("opacity",1);

}

