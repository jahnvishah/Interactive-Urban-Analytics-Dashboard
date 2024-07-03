var w = 1000;
var h = 800;

var path, mapsSVG, buildingColors, bbox, dx, dy, projection;

// The extent of your data in meters (min x, min y, max x, max y)
// Assuming the origin (0,0) is at the top-left corner of the extent
var extent = [0, 0, 8000, 8000]; // 8km by 8km extent

// Building type colors
buildingColors = {
  "Commercial": "#4e79a7",
  "Residential": "#e15759",
  "School": "#f28e2c"
};

// Import GeoJSON data
d3.json("preprocessed_data/buildings.json").then(function (data) {
  var geojsonData = topojson.feature(data, data.objects.buildings);

  // Calculate the scale and translation to fit the GeoJSON data in the mapsSVG
  projection = d3.geoIdentity()
    .fitSize([w, h], geojsonData)
    .reflectY(true)
    .translate([w, h]); // Center the map in the mapsSVG

  path = d3.geoPath().projection(projection);

  // Get the bounding box of the projected GeoJSON data
  bbox = path.bounds(geojsonData);

  // Calculate the translation values to center the map
  dx = (bbox[0][0] + bbox[1][0]) / 2 - w / 2;
  dy = (bbox[0][1] + bbox[1][1]) / 2 - h / 2;

  // Apply the translation
  projection = projection.translate([w- dx, h - dy]);

  mapsSVG = d3.select("#chart")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

  // Create tooltip
  var tooltip = d3.select("#tooltip");

  // Building type colors
  buildingColors = {
    "Commercial": "#4e79a7",
    "Residential": "#e15759",
    "School": "#f28e2c"
  };

  // ["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"]
  path = d3.geoPath().projection(projection);

  var curOpacity;
  buildings = mapsSVG.selectAll("path")
    .data(geojsonData.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class","buildings")
    .attr("fill", function (d) {

      return buildingColors[d.properties.buildingType]

    })
    .attr("opacity", 0.5)
    .attr("stroke", "black")
    .on("mouseover", function (event, d) {
      // Update tooltip
      tooltip.style("opacity", 1)
        .html(d.properties.buildingType);
      
      curOpacity = d3.select(this).attr("opacity");

      // Highlight polygon
      d3.select(this).attr("opacity", 1);
    })
    .on("mousemove", function (event) {
      // Position tooltip
      tooltip.style("left", (event.pageX) + "px")
        .style("top", (event.pageY + 15) + "px");
    })
    .on("mouseout", function (d) {
      // Hide tooltip
      tooltip.style("opacity", 0);

      // Reset opacity
      d3.select(this).attr("opacity",curOpacity);
      //d3.select(this).attr("opacity", 0.2);


    });

      //Add legends
      var legend = mapsSVG.append("g")
      .attr("transform", "translate(" + (w - 200) + ", 20)");
    
    legend.append("text")
      .attr("font-weight", "bold")
      .text("Business Type");
    
    var legendItems = legend.selectAll(".legend-item")
      .data(Object.keys(buildingColors))
      .enter()
      .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => "translate(0," + (i * 15 + 10) + ")");
    
    legendItems.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr('stroke', 'black')
      .attr("fill", d => buildingColors[d]);
    
    legendItems.append("text")
      .attr("x", 20)
      .attr("y", 5)
      .attr("dy", ".35em")
      .text(d => d);
    
    // Add legend for pubs, restaurants, and schools
    var bubbleColors = {
      "Pub": "#0CA6F5", // Light Blue
      "Restaurant": "#1175A8", // Dark Blue
      "School": "#DE970B" // Dark Yellow
    };
    
    var bubbleLegend = mapsSVG.append("g")
      .attr("transform", "translate(" + (w - 200) + ", 100)"); // Adjust the Y position as needed
    
    bubbleLegend.append("text")
      .attr("font-weight", "bold")
      .text("Points of Interest");
    
    var bubbleLegendItems = bubbleLegend.selectAll(".bubble-legend-item")
      .data(Object.keys(bubbleColors))
      .enter()
      .append("g")
        .attr("class", "bubble-legend-item")
        .attr("transform", (d, i) => "translate(0," + (i * 15 + 10) + ")");
    
    bubbleLegendItems.append("circle")
      .attr("cx", 5)
      .attr("cy", 5)
      .attr("r", 5)
      .attr('stroke', 'black')
      .style("fill", d => bubbleColors[d]);
    
    bubbleLegendItems.append("text")
      .attr("x", 20)
      .attr("y", 5)
      .attr("dy", ".35em")
      .text(d => d);

      
 //Add Pubs cirlces
  var i = 0;

  // Load and display CSV data
  d3.csv("preprocessed_data/Pubs.csv", function (data) {
    var coordinates = extractCoordinates(data.location);

    if(i>2)
      coordinates[0] = w - coordinates[0];
    else  
    coordinates[0] += 980;
    // console.log(coordinates[0]);
    if (coordinates) {

      var pubCoordinates = [
        coordinates[0] + dx,
        coordinates[1] + dy
      ];
    
      // Adjust the scale factor for the pubs
      var pubProjection = d3.geoIdentity()
        .reflectY(true)
        .translate([w - dx, h - dy])
        .fitSize([w, h], geojsonData);

      
      // Draw points for each pub using the same projection
      var pubs = mapsSVG.append('circle')
        .attr('cx', pubProjection(coordinates)[0] - 100)
        .attr('cy', pubProjection(coordinates)[1])
        .attr('r', 5)
        .attr('fill', "#0CA6F5") //Light Blue
        .attr('stroke', 'black')
        .attr("opacity",1)
        .attr("class","Pubs")
      
      pubs.on("mouseover", function (event) {

        
          tooltip.style("opacity", 1)
            .html("Pub");
        })
        .on("mousemove", function (event) {
          tooltip.style("left", (event.pageX) + "px")
            .style("top", (event.pageY + 15) + "px");
        })
        .on("mouseout", function (d) {
          tooltip.style("opacity", 0);    
        });
        

        i+=1;
    }
  });

//Add Restaurants cirlces

  var j = 0;

  // Load and display CSV data
  d3.csv("preprocessed_data/Restaurants.csv", function (data) {
    var coordinates = extractCoordinates(data.location);
    
    if(j>4)
      coordinates[0] = w - coordinates[0];
    else  
    coordinates[0] += 980;
    // console.log(coordinates[0]);
    if (coordinates) {

      var pubCoordinates = [
        coordinates[0] + dx,
        coordinates[1] + dy
      ];
    
      // Adjust the scale factor for the pubs
      var pubProjection = d3.geoIdentity()
        .reflectY(true)
        .translate([w - dx, h - dy])
        .fitSize([w, h], geojsonData);

      
      // Draw points for each pub using the same projection
      var restaurants = mapsSVG.append('circle')
        .attr('cx', pubProjection(coordinates)[0] - 100)
        .attr('cy', pubProjection(coordinates)[1])
        .attr('r', 5)
        .attr('fill', "#1175A8") //Dark blue
        .attr('stroke', 'black')
        .attr("opacity",1)
        .attr("class","Restaurants");

            
        restaurants.on("mouseover", function (event) {

          tooltip.style("opacity", 1)
            .html("Restaurant");
        })
        .on("mousemove", function (event) {
          tooltip.style("left", (event.pageX) + "px")
            .style("top", (event.pageY + 15) + "px");
        })
        .on("mouseout", function (d) {
          tooltip.style("opacity", 0);    
        });
        

        j+=1;
    }
  });

  //Add Schools cirlces
  var k = 0;

  // Load and display CSV data
  d3.csv("preprocessed_data/Schools.csv", function (data) {
    var coordinates = extractCoordinates(data.location);

      coordinates[0] = w - coordinates[0];
    if (coordinates) {

      var pubCoordinates = [
        coordinates[0] + dx,
        coordinates[1] + dy
      ];
    
      // Adjust the scale factor for the pubs
      var pubProjection = d3.geoIdentity()
        .reflectY(true)
        .translate([w - dx, h - dy])
        .fitSize([w, h], geojsonData);

      
      // Draw points for each pub using the same projection
      var schools = mapsSVG.append('circle')
        .attr('cx', pubProjection(coordinates)[0] - 100)
        .attr('cy', pubProjection(coordinates)[1])
        .attr('r', 5)
        .attr('fill', "#DE970B") // Dark yellow
        .attr('stroke', 'black')
        .attr("opacity",1)
        .attr("class","Schools");

              
      schools.on("mouseover", function (event) {

        tooltip.style("opacity", 1)
          .html("School");
      })
      .on("mousemove", function (event) {
        tooltip.style("left", (event.pageX) + "px")
          .style("top", (event.pageY + 15) + "px");
      })
      .on("mouseout", function (d) {
        tooltip.style("opacity", 0);    
      });
      

        k+=1;
    }
  });

});

// Function to extract x and y coordinates from POINT data
function extractCoordinates(pointString) {
  var coordinates = pointString.match(/\d+\.\d+/g);
  if (coordinates && coordinates.length >= 2) {
    var x = parseFloat(coordinates[0]);
    var y = parseFloat(coordinates[1]);
    return [x, y];
  } else {
    return null;
  }
}

function plotParticipantSocialActivity(show, data){

  // var w = 
  // return 0;

  if(show){

    const arr = data.visitedPlaces;

    buildings.attr("opacity", d => {

      if(arr.indexOf(d.properties.buildingId.toString())!==-1){
        return 1;
      }

      return 0.5;

    }).style("stroke-width",(d) => {

      console.log(d);
      // var w = buildings.style("stroke-width");

      if(arr.indexOf(d.properties.buildingId.toString())!==-1){
        return "3";
      }

    });

  }else{

    buildings.attr("opacity",(d) => {

      return 0.5;

    }).style("stroke-width",(d) => {

      return 1;

    });

  }
  
}
