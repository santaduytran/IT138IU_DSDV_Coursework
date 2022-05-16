var datasetURL =
  "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";

d3.csv(datasetURL, function (error, data) {
    if (error) {console.log(error);} 
    else {console.log(data);

// Add a label column includes province name and country name as labels for the bars
    for (var idx = 0; idx < data.length; idx++) {
      if (data[idx]["Province/State"].length != 0) {
        data[idx]["label"] =
          data[idx]["Province/State"] +
          "," +
          data[idx]["Country/Region"];
      } else {
        data[idx]["label"] = data[idx]["Country/Region"];
      }
    }
// Choose only non-zero row on "1/22/20" column with filter function
    var dataset = data.filter(function (d) {
      return d["5/4/20"] != 0;
    });

    var w = 1500;
    var h = 1500;
    var margin = {top: 100, right: 0, bottom: 130, left: 80};
    var outerHeight = h + margin.top + margin.bottom;
    var outerWidth = w + margin.right + margin.left;
    var padding = 20;

    var svg = d3.select("body")
                .append("svg")
                .attr("width", outerWidth)
                .attr("height", outerHeight);
    // Base on the Earth's coordinates, the longitude has X-coordinate between -180 and 180 degrees
    var xScale = d3.scaleLinear()
                   .domain([-180, 180])
                   .range([0, w - padding]);
    // The latitude has Y-coordinates between -90 and 90 degrees
    var yScale = d3.scaleLinear()
                   .domain([-90, 90])
                   .range([h - padding, 0]);
    var rScale = d3.scaleSqrt()
                   .domain([0, d3.max(dataset, function(d) {return parseInt(d["5/4/20"]);}),])
                   .range([1, 25]);
    // Add the data points on the scatter plot
    svg.selectAll("circle")
       .data(dataset)
       .enter()
       .append("circle")
       .attr("cx", function (d) {return xScale(parseFloat(d["Long"])) + margin.left;})
       .attr("cy", function (d) {return yScale(d["Lat"]) + margin.top + padding;})
       .attr("r", function (d) {return rScale(parseInt(d["5/4/20"]));})
       .attr("stroke", "red")
       .attr("stroke-width", 0.3)
       .attr("fill", "#DE849D")
       .attr("fill-opacity", 0.6)
       .on("mouseover", function () {d3.select(this).attr("fill", "#93311B");})
       .on("mouseout", function (d) {d3.select(this)
                                       .transition()
                                       .duration(250)
                                       .attr("fill", "#DE849D ");
                                    })
       .append("title")
       .text(function (d) {return ("Province/Country: " +
                                   d["label"] +
                                   "\nNumber of confirmed case: " +
                                   d["5/4/20"]);
                          }
		    );

    // Add the axis
    var g = svg.append("g")
               .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var xAxis = d3.axisBottom().scale(xScale);
    var yAxis = d3.axisLeft().scale(yScale);
    g.append("g")
     .attr("transform", "translate(0," + (margin.top - margin.left) + ")")
     .call(yAxis);
    g.append("g")
     .attr("class", "x axis")
     .attr("transform", "translate(0," + h + ")")
     .call(xAxis);
    // Add axis's label
    g.append("text") //  x-axis label
      .attr("text-anchor", "end")
      .attr("x", w - 20)
      .attr("y", h + 50)
      .attr("font-size", 17)
      .attr("font-family", "sans-serif")
      .text("Longitude");
    g.append("text") //  y-axis label
     .attr("text-anchor", "end")
     .attr("x", -20)
     .attr("y", -50)
     .attr("transform", "rotate(-90)")
     .attr("font-size", 17)
     .attr("font-family", "sans-serif")
     .text("Latitude");
  }
});
