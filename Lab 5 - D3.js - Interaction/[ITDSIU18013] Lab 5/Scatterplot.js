var datasetURL =
  "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";

d3.csv(datasetURL, function (error, data) {
  if (error) {console.log(error);} 
  else {
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

    var dataset = data.filter(function (d) {return d["5/4/20"] != 0;});

    dataset = dataset.sort(function (a, b) {
      const countryA = parseInt(a["5/4/20"]);
      const countryB = parseInt(b["5/4/20"]);

      if (countryA > countryB) return -1;
      else if (countryA < countryB) return 1;
      else return 0;
    });

    var w = 1555;
    var h = 1555;
    var margin = {top: 100, right: 0, bottom: 130, left: 80};
    var outerHeight = h + margin.top + margin.bottom;
    var outerWidth = w + margin.right + margin.left;
    var padding = 20;

    var svg = d3.select("body")
                .append("svg")
                .attr("width", outerWidth)
                .attr("height", outerHeight);
    var xScale = d3.scaleLinear()
                   .domain([-180, 180])
                   .range([0, w - padding]);
    var yScale = d3.scaleLinear()
                   .domain([-90, 90])
                   .range([h - padding, 0]);
    var rScale = d3.scaleSqrt()
                   .domain([0, d3.max(dataset, function (d) {return parseInt(d["5/4/20"]);}),])
                   .range([1, 35]);
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
       .on("mouseover", function (d) {
        // get x,y of the circle, then augment for the tooltip
        var xPosition = parseFloat(d3.select(this).attr("cx"));
        var yPosition = parseFloat(d3.select(this).attr("cy")) + h / 2;
        // find the ranking of each country
        for (var idx = 0; idx < dataset.length; idx++) {
          if (d["label"] == dataset[idx]["label"]) var rank = idx + 1;
        }

        d3.select("#tooltip")
          .html(
            "<strong>Top</strong>: " +
              rank +
              "<br>" +
              "<strong>Province/Country</strong>: " +
              d["label"] +
              "<br>" +
              "<strong>Confirmed case</strong>: " +
              d["5/4/20"]
            )
          .style("left", xPosition + "px")
          .style("top", yPosition + "px");

        d3.select("#tooltip").classed("hidden", false);
        d3.select(this).attr("fill", "#93311B");
      })
      .on("mouseout", function (d) {
        d3.select("#tooltip").classed("hidden", true);
        d3.select(this).attr("fill", "#DE849D ");
      });

    // Add the axis
    var g = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var xAxis = d3.axisBottom().scale(xScale);
    var yAxis = d3.axisLeft().scale(yScale);
    g.append("g")
      .attr("transform", "translate(0," + (margin.top - margin.left) + ")")
      .call(yAxis);
    g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
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
