var rowConverter = function (d) {
  return {
    population: parseFloat(d.population),
    area: parseFloat(d.area),
    density: parseFloat(d.density),
    GRDP_VND: parseFloat(d["GRDP-VND"]),
    province: d.province,
  };
};
d3.csv("https://tungth.github.io/data/vn-provinces-data.csv", rowConverter, function (error, data) {
    if (error) {
      console.log(error);
    } else {
      console.log(data);

      var w = 600;
      var h = 300;
      var margin = { top: 20, right: 20, bottom: 40, left: 70 };
      var outer_w = w + margin.right + margin.left;
      var outer_h = h + margin.top + margin.bottom;
      padding = 1;

      var NUMBERS_OF_PROVINCE = 20; // Numbers of province in the datasset
      var dataset = data.slice(0, NUMBERS_OF_PROVINCE - 1);

      var svg = d3
        .select("body")
        .append("svg")
        .attr("width", outer_w)
        .attr("height", outer_h)
        .append("g")
        .attr(
          "transform",
          "translate(" + margin.left + "," + margin.top + ")"
        );

      var colorScale = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(dataset, function (d) {
            return d.GRDP_VND;
          }),
        ])
        .range([5, 200]);

      /**
       * Create x, y axis and add to the group
       */
      var xScale = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(dataset, function (d) {
            return d.GRDP_VND;
          }),
        ])
        .range([0, w]);
      var xAxis = d3.axisBottom().scale(xScale);
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + h + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

      var yScale = d3
        .scaleBand()
        .range([0, h])
        .domain(
          dataset.map(function (d) {
            return d.province;
          })
        )
        .padding(0.1);
      var yAxis = d3.axisLeft().scale(yScale);
      svg.append("g").attr("class", "y axis").call(yAxis);
      // The initial chart with the first 20 provinces
      svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("x", xScale(0))
        .attr("y", function (d) {
          return yScale(d.province);
        })
        .attr("width", function (d) {
          return xScale(d.GRDP_VND);
        })
        .attr("height", yScale.bandwidth())
        .attr("fill", "#00FA9A");

      var newDataset;
      /**
       * On click, adding or removing a province when the button is clicked
       */
      d3.selectAll("button").on("click", function () {
        var paragraphID = d3.select(this).attr("id");
        console.log(d3.select(this).attr("id"));
        // Update the numbers of province in the dataset
        if (paragraphID == "add") {
          NUMBERS_OF_PROVINCE += 1;
        } else if (paragraphID == "remove") {
          NUMBERS_OF_PROVINCE -= 1;
        }
        // Update the dataset
        newDataset = data.slice(0, NUMBERS_OF_PROVINCE - 1);
        console.log(newDataset);
        console.log(
          newDataset.map(function (d) {
            return d.province;
          })
        );
        xScale.domain([
          0,
          d3.max(newDataset, function (d) {
            return d.GRDP_VND;
          }),
        ]);
        yScale.domain(
          newDataset.map(function (d) {
            return d.province;
          })
        );

        var bars = svg.selectAll("rect").data(newDataset);

        bars.enter()
          .append("rect")
          .attr("x", xScale(0))
          .attr("y", function (d) {
            return yScale(d.province);
          })
          .attr("width", function (d) {
            return xScale(d.GRDP_VND);
          })
          .attr("height", yScale.bandwidth())
          .attr("fill", "#C71585")
          .merge(bars) //Merges the enter selection with the update selection
          .transition() //Initiate a transition on all elements in the update selection (all rects)
          .duration(500)
          .attr("x", xScale(0)) //Set new x position, based on the updated xScale
          .attr("y", function (d) {
            return yScale(d.province);
          }) //Set new y position, based on the updated yScale
          .attr("width", function (d) {
            return xScale(d.GRDP_VND);
          }) //Set new width value, based on the updated xScale
          .attr("height", yScale.bandwidth()) //Set new height value, based on the updated yScale
          .attr("fill", "#00FA9A");

        svg.select(".x.axis").transition().duration(500).call(xAxis);
        svg.select(".y.axis").transition().duration(500).call(yAxis);

        bars.exit() //References the exit selection (a subset of the update selection)
          .transition() //Initiates a transition on the one element we're deleting
          .duration(500)
          .attr("x", w) //Move past the right edge of the SVG
          .remove();
      });
      d3.select("#sort_criterion").on("change", function () {
        // d3.event is set to the current event within an event listener
        let criterion = d3.event.target.value;
        newDataset = newDataset.sort(function (a, b) {
          switch (criterion) {
            case "province":
              // lexicographic sorting for province name
              if (a[criterion] < b[criterion]) return -1;
              else if (a[criterion] > b[criterion]) return 1;
              else return 0;
          }
        });
      });
    }
  }
);
