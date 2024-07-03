# Interactive-Urban-Analytics-Dashboard
**Interactive Urban Analytics Dashboard**

**Overview**

Welcome to the Interactive Urban Analytics Dashboard repository! This project was developed as part of the VAST Challenge 2022, focusing on creating a comprehensive urban analytics visualization system. Our dashboard integrates various statistical graphics and interactive visualizations to provide deep insights into urban data, aiding participatory planning exercises.

**Team Members**

Palak Bhalodi
Jahnvi Shah
Siddhant Sorann
Krutik Parmar
Rahil Patel
Arush Patel

**Project Description**

Our urban analytics visualization system leverages principles of the Nested Model to create an interactive dashboard that ties together multiple statistical graphics. These include stacked bars, bubble plots, networks, time series lines, pie charts, and choropleth maps. The goal is to enable exploratory analysis along three key dimensions: demographics, social patterns, and business distribution.

**Key Features**
**Demographic Analysis: ** Visualize participant distribution by age and education levels, showcasing trends like average joviality.
**Household Size Distribution:** Compare education levels and household sizes, highlighting trends in average household sizes.
**Social Network Visualization:** Display social interactions among participants, with demographic segregation options.
**Temporal Social Activity:** Analyze social activity intensity over time with demographic filters.
**Business Distribution:** Visualize the distribution of different businesses and identify predominant business categories.
**Geographic Analysis:** Map the geographic distribution of businesses across the town.

**Visualization Design**

**Chart Descriptions**
**Age, Education & Joviality Demographics** (**Stacked Bar Chart**)

Visualizes participant distribution by age groups and education levels.
Shows trends in average joviality.

**Education Level vs. Grouped Household Size Distribution** (**Bubble Plot**)

Compares education levels and household sizes.
Shows trends in average household sizes.

**Social Network** (**Node-Link Diagram**)

Visualizes social interactions between participants.
Allows toggling node color encoding between age and education attributes.

**Social Activity Over Time** (**Time Series Line Chart**)

Displays social activity intensity patterns over time.
Offers demographic segregation options.

**Statistical Business Base** (**Donut & Pie Chart**)

Shows the distribution of different businesses in the town.
Highlights the predominant business category.

**Geographic Distribution of Businesses** (**Choropleth Map**)

Maps the geographic distribution of businesses.
Uses color shading to represent different business types.

**Dataset Description**

The dataset comprises three types of logs:

Activity Logs: Record location, status, and activities of participants every 5 minutes over a 15-month period.
Attribute Logs: Provide details about entities in the city like apartments, jobs, restaurants, schools, and participants.
Journal Logs: Document specific activities like check-ins, financial transactions, social activities, and travel.

**System Interactions**

Filtering: Use UI filters to slice data by attributes like age group and education level.
Hover Details: Informative tooltips provide details-on-demand by hovering over data points.
Brushing and Linking: Selecting any data component cross highlights and filters relevant subsets in associated visualizations.
Interactivity: Dynamic updates and selections facilitate an intuitive exploration and analysis experience.


**Installation**

To get started with the Interactive Urban Analytics Dashboard:

Clone the repository:
sh
Copy code
git clone https://github.com/jahnvishah/Interactive-Urban-Analytics-Dashboard.git
Navigate to the project directory:
sh
Copy code
cd Interactive-Urban-Analytics-Dashboard
Install the required dependencies:
sh
Copy code
pip install -r requirements.txt
Run the application:
sh
Copy code
python app.py
Usage

Once the application is running, open your browser and navigate to http://localhost:5000. You can interact with the various visualizations, apply filters, and explore the urban data.

**Conclusion**

This project provides a powerful tool for urban planners and residents to analyze and understand the dynamics of their city. The interactive dashboard empowers users to explore demographic trends, social patterns, and business distributions, informing better community planning and decision-making.

