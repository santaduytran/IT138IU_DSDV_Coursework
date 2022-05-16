var datasetUrl = "https://raw.githubusercontent.com/trieulongben/dsdv-data-lab6/main/lab6.csv";
var parseTime = d3.timeFormat("%Y-%m-%d");
var rowConverter = function (d) {
  return {
    Date: new Date(d["Date"]),
    Country: d["Country"],
    ConfirmedCase: +parseInt(d["Confirmed cases"]),
  };
};

d3.csv(datasetUrl, rowConverter, function (error, data) {
  if (error) {
    console.log(error);
  } else {
    console.log(data);
    var nestedData = d3
      .nest()
      .key((d) => d["Country"])
      .entries(data);

    console.log(nestedData);
    console.log(nestedData[0].values);

    var outerWidth = 900;
    var outerHeight = 700;
    var margin = {top: 100, right: 100, bottom: 100, left: 90};
    var height = outerHeight - margin.top - margin.bottom;
    var width = outerWidth - margin.right - margin.left;
    var padding = 20;

    var svg = d3
      .select("body")
      .append("svg")
      .attr("width", outerWidth)
      .attr("height", outerHeight);
    //Add X axis
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d["Date"]))
      .range([0, width - padding]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d["ConfirmedCase"])])
      .range([height - padding, 0]);

    const colorScale = d3
      .scaleOrdinal(d3.schemeCategory10)
      .domain(nestedData.map((d) => d.key));

    // Line generator
    var line = d3
      .line()
      .x((d) => xScale(d["Date"]))
      .y((d) => yScale(d["ConfirmedCase"]) + padding)
      .curve(d3.curveBasis);

    svg.selectAll(".line-path")
      .data(nestedData)
      .enter()
      .append("path")
      .attr(
        "transform",
        "translate(" + margin.left + "," + margin.top + ")"
      )
      .attr("class", "line-path")
      .attr("id", (d) => d.key)
      .attr("d", (d) => line(d.values))
      .attr("stroke", (d) => colorScale(d.key));

    var highlight = function (d) {
      d3.selectAll(".line-path").style("opacity", 0.05);
      d3.select("#" + d.key).style("opacity", 1);
    };

    var noHighlight = function (d) {
      d3.selectAll(".line-path").style("opacity", 1);
    };

    var legend = svg
      .selectAll("g")
      .data(nestedData)
      .enter()
      .append("g")
      .attr("class", "legend");

    legend
      .append("circle")
      .attr("cx", width + margin.left + 20)
      .attr("cy", (d, i) => i * 30 + padding + margin.top)
      .attr("r", 8)
      .attr("fill", (d) => colorScale(d.key))
      .on("mouseover", highlight)
      .on("mouseleave", noHighlight);

    legend
      .append("text")
      .attr("x", width + margin.left + 30)
      .attr("y", (d, i) => i * 30 + padding + margin.top + 4)
      .text((d) => d.key)
      .attr("font-family", "sans-serif")
      .attr("fill", (d) => colorScale(d.key))
      .on("mouseover", highlight)
      .on("mouseleave", noHighlight);

    var g = svg
      .append("g")
      .attr(
        "transform",
        "translate(" + margin.left + "," + margin.top + ")"
      );

    var xAxis = d3.axisBottom().scale(xScale);
    var yAxis = d3.axisLeft().scale(yScale);

    g.append("g")
      .attr(
        "transform",
        "translate(0," + (margin.left - margin.top + padding + 10) + ")"
      )
      .call(yAxis);

    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis.tickFormat(d3.timeFormat("%b-%d")));

    // Add axis's label
    g.append("text") //  x-axis label
      .attr("text-anchor", "end")
      .attr("x", width - 70)
      .attr("y", height + 50)
      .attr("font-size", 17)
      .attr("font-family", "sans-serif")
      .text("Date");
    g.append("text") //  y-axis label
      .attr("text-anchor", "end")
      .attr("x", -80)
      .attr("y", -70)
      .attr("transform", "rotate(-90)")
      .attr("font-size", 17)
      .attr("font-family", "sans-serif")
      .text("Confirmed Case");

    var mouseG = svg.append("g").attr("class", "mouse-over-effects");

    mouseG
      .append("path") // black vertical line that follow mouse
      .attr("class", "mouse-line")
      .attr(
        "transform",
        "translate(" + margin.left + "," + margin.top + ")"
      )
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .style("opacity", "0");

    var lines = document.getElementsByClassName("line-path");

    var mousePerLine = mouseG
      .selectAll(".mouse-per-line")
      .data(nestedData)
      .enter()
      .append("g")
      .attr("class", "mouse-per-line");

    // Create the circle that travels along the curve of chart
    mousePerLine
      .append("circle")
      .attr("r", 5)
      .attr(
        "transform",
        "translate(" + margin.left + "," + margin.top + ")"
      )
      .style("stroke", (d) => colorScale(d.key))
      .style("fill", "none")
      .style("stroke-width", "1px")
      .style("opacity", "0");

    mousePerLine
      .append("text")
      .attr(
        "transform",
        "translate(" + margin.left + "," + (margin.top - 10) + ")"
      );

    mouseG
      .append("svg:rect") // append a rect to catch mouse movements on canvas
      .attr(
        "transform",
        "translate(" + margin.left + "," + margin.top + ")"
      )
      .attr("width", width - padding)
      .attr("height", height)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("mouseout", function () {
        // on mouse out hide line, circles and text
        d3.select(".mouse-line").style("opacity", "0");
        d3.selectAll(".mouse-per-line circle").style("opacity", "0");
        d3.selectAll(".mouse-per-line text").style("opacity", "0");
      })
      .on("mouseover", function () {
        // on mouse in show line, circles and text
        d3.select(".mouse-line").style("opacity", "1");
        d3.selectAll(".mouse-per-line circle").style("opacity", "1");
        d3.selectAll(".mouse-per-line text").style("opacity", "1");
      })
      .on("mousemove", function () {
        // mouse moving over canvas
        var mouse = d3.mouse(this);
        d3.select(".mouse-line").attr("d", function () {
          var d = "M" + mouse[0] + "," + height;
          d += " " + mouse[0] + "," + 0;
          //   console.log("d: "+d);
          return d;
        });

        d3.selectAll(".mouse-per-line").attr(
          "transform",
          function (d, i) {
            // console.log(width/mouse[0])
            var xDate = xScale.invert(mouse[0]),
              bisect = d3.bisector(function (d) {
                return d["Date"];
              }).right;
            // console.log("xDate: " + xDate)
            idx = bisect(d.values, xDate, 1);
            // console.log("idx: " + idx);
            var selectedData = nestedData[i].values[idx];
            // console.log(selectedData);

            var beginning = 0,
              end = lines[i].getTotalLength(),
              target = null;

            // console.log("end:"  + end)
            while (true) {
              target = Math.floor((beginning + end) / 2);
              pos = lines[i].getPointAtLength(target); // SVGPoint
              // console.log(pos);
              if (
                (target === end || target === beginning) &&
                pos.x !== mouse[0]
              ) {
                break;
              }
              if (pos.x > mouse[0]) end = target;
              else if (pos.x < mouse[0]) beginning = target;
              else break; //position found
            }

            d3.select(this)
              .select("text")
              .html(selectedData["ConfirmedCase"])
              .attr("font-family", "sans-serif")
              .attr("font-size", "10px")
              .attr("font-weight", "bold");

            return "translate(" + mouse[0] + "," + pos.y + ")";
          }
        );
      });
  }
});
