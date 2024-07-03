let ageGroupCheckboxes;
let educationLevelCheckboxes;
let ageSelected = true;
let lastScrollPosition = 0;
let headingToHide;

document.addEventListener("DOMContentLoaded", function () {
    headingToHide = document.getElementById('headingToHide');
    const demographicBtn = document.getElementById('demographic');
    const socialBtn = document.getElementById('social');
    const businessBtn = document.getElementById('business');
    window.addEventListener('scroll', function() {
        const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
        if (currentScrollPosition > lastScrollPosition) {
            // Scrolling down, hide the heading
            headingToHide.classList.add('hidden');
        } else {
            // Scrolling up, show the heading
            headingToHide.classList.remove('hidden');
        }

        if (currentScrollPosition >= 2450) {
            businessBtn.classList.add('active');
            socialBtn.classList.remove('active');
            demographicBtn.classList.remove('active');
        } else if (currentScrollPosition >= 850) {
            socialBtn.classList.add('active');
            demographicBtn.classList.remove('active');
            businessBtn.classList.remove('active');
        } else {
            demographicBtn.classList.add('active');
            socialBtn.classList.remove('active');
            businessBtn.classList.remove('active');
        }
        
        lastScrollPosition = currentScrollPosition <= 0 ? 0 : currentScrollPosition;
    });
    createAgeGroupCheckboxes();
    ageGroupCheckboxes = document.querySelectorAll('input[name="ageGroup"]');
    ageGroupCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            filterData();
        });
    });
    educationLevelCheckboxes = document.querySelectorAll('input[name="educationLevel"]');
    educationLevelCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            filterData();
        });
    });


    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const width = 1200 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    let legendWidth = 200;
    let legendPadding = 10;
    const educationLevels = ["Low", "HighSchoolOrCollege", "Bachelors", "Graduate"];

    colorScale = d3.scaleOrdinal()
        .domain(educationLevels)
        .range(["#4e79a7","#f28e2c","#e15759","#76b7b2"]);

    let svg2 = d3.select("#chart2")
        .append("svg")
        .attr("width", width + margin.left + margin.right + legendWidth)
        .attr("height", 50)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const legend = svg2.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width/2-175},${5})`);

    legend.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", colorScale("Low"))
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    legend.append("text").attr("x", 12)
        .attr("y", 5)
        .attr("dy", "0.35em")
        .text("Low")
        .style("overflow", "hidden")
        .style("text-overflow", "ellipsis");

    legend.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", colorScale("HighSchoolOrCollege"))
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("transform", "translate(50,0)");

    legend.append("text")
        .attr("x", 62)
        .attr("y", 5)
        .attr("dy", "0.35em")
        .text("High School or College")
        .style("overflow", "hidden")
        .style("text-overflow", "ellipsis");

    legend.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", colorScale("Bachelors"))
        .attr("transform", "translate(200,0)")
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    legend.append("text")
        .attr("x", 212)
        .attr("y", 5)
        .attr("dy", "0.35em")
        .text("Bachelors")
        .style("overflow", "hidden")
        .style("text-overflow", "ellipsis");

    legend.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", colorScale("Graduate"))
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("transform", "translate(275,0)");

    legend.append("text")
        .attr("x", 287)
        .attr("y", 5)
        .attr("dy", "0.35em")
        .text("Graduate")
        .style("overflow", "hidden")
        .style("text-overflow", "ellipsis");

    legend.append("path")
        .attr("d", "M0,6L15,6")
        .style("stroke", "steelblue")
        .attr("stroke-width", 4)
        .attr("transform", "translate(350,0)");

    legend.append("text")
        .attr("x", 0)
        .attr("y", 5)
        .attr("dy", "0.35em")
        .text("Average Joviality")
        .attr("transform", "translate(367,0)");

    legend.append("path")
        .attr("d", "M0,6L15,6")
        .style("stroke", "black")
        .style("stroke-width", 4)
        .attr("transform", "translate(470,0)");

    legend.append("text")
        .attr("x", 0)
        .attr("y", 5)
        .attr("dy", "0.35em")
        .text("Average household Size")
        .attr("transform", "translate(487,0)");
});

function filterData() {
    const ageGroupCheckboxes = document.querySelectorAll('input[name="ageGroup"]:checked');
    const educationLevelCheckboxes = document.querySelectorAll('input[name="educationLevel"]:checked');
    
    const selectedAgeGroups = Array.from(ageGroupCheckboxes).map(checkbox => checkbox.value);
    const selectedEducationLevels = Array.from(educationLevelCheckboxes).map(checkbox => checkbox.value);

    var ssorannIFrame = document.getElementById('ssorann');
    var filterFunction = ssorannIFrame.contentWindow.filterData;
    filterFunction(selectedAgeGroups, selectedEducationLevels);

    var jshahIFrame = document.getElementById('jshah');
    var filterFunction = jshahIFrame.contentWindow.filterData;
    filterFunction(selectedAgeGroups, selectedEducationLevels);

    var rvpatel6IFrame = document.getElementById('rvpatel6');
    var filterFunction = rvpatel6IFrame.contentWindow.filterData;
    filterFunction(selectedAgeGroups, selectedEducationLevels);
}

function createAgeGroupCheckboxes() {
    const ageGroupContainer = document.getElementById('ageGroupContainer');
    const ageGroups = ["18-24", "25-31", "32-38", "39-45", "46-52", "53-60"];

    ageGroups.forEach(group => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = group.toLowerCase().replace(' ', '-');
        checkbox.name = 'ageGroup';
        checkbox.value = group;
        checkbox.checked = true;
        
        const label = document.createElement('label');
        label.htmlFor = group.toLowerCase().replace(' ', '-');
        label.appendChild(document.createTextNode(group));

        const div = document.createElement('div');
        div.appendChild(checkbox);
        div.appendChild(label);

        ageGroupContainer.appendChild(div);
    });
}

function onClassificationSelectionChange() {
    var selectedValue = document.querySelector('input[name="classification"]:checked').id;
  
    if(selectedValue == 'age_group'){
      ageSelected = true;
    } else {
      ageSelected = false;
    }

    var rvpatel6IFrame = document.getElementById('rvpatel6');
    var classificationChangeFunction = rvpatel6IFrame.contentWindow.onSelectionChange;
    classificationChangeFunction(ageSelected);
}

async function dateChanged(){
    let datePicker = document.getElementById('graph_date');
    selectedDate = datePicker.value;
    var rvpatel6IFrame = document.getElementById('rvpatel6');
    var dateChangeFunction = rvpatel6IFrame.contentWindow.dateChanged;
    dateChangeFunction(selectedDate);
  }