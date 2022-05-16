//Function for converting CSV values from strings to Dates and numbers
var rowConverter = function(d) {
	return {Country: d["Country/Region"],
			Province: d["Province/State"],
			Lat: parseFloat(d["Lat"]),
			Long: parseFloat(d["Long"]),
			"5/4/20": parseInt(d["5/4/20"])
		    };
	}

const w = 1500;
const h = 1500;

var svg = d3.select("body")
			.append("svg")
			.attr("width", w)
			.attr("height", h);

//Read the data			
d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv", rowConverter, function (error, data) {
    //console.log(data);
	var dataset = data.filter(d => d["5/4/20"] > 0);
	console.log(dataset);
	
	var xScale = d3.scaleLinear()
					.domain([-180, 180])
					.range([10, w  - 10]);
					
	var yScale = d3.scaleLinear()
					.domain([-90, 90])
					.range([h, 50]);
					
	var rScale = d3.scaleSqrt()
					.domain([d3.min(dataset, function (d) {return d["5/4/20"]; }),
						     d3.max(dataset, function (d) {return d["5/4/20"]; })])
					.range([5, 50]);
	
//Define X axis	
	var xAxis = d3.axisBottom(xScale)
				  .ticks(20); //Set rough number of ticks

//Define Y axis
	var yAxis = d3.axisLeft(yScale)
				  .ticks(20); //Set rough number of ticks
					
	svg.selectAll("circle")
	   .data(dataset)
	   .enter()
 	   .append("circle")
	   .attr("cx", function (d) {return xScale(d.Long); })
	   .attr("cy", function (d) {return yScale(d.Lat); })
	   .attr("r", function (d) {return rScale(d["5/4/20"]); })	
	   .transition()
	   .delay(function (d,i) {return i * 50;})
	   .duration(300)	
	   .attr("fill" ,"red")
	   .attr("stroke", "black")
	   .attr("fill-opacity", 0.2);

//Create X axis	
	svg.append("g")
	   .attr("class", "axis") //Assign "axis" class
	   .attr("transform", "translate(0," + (h - 100 ) + ")")
	   .call(xAxis);
		
//Create Y axis
	svg.append("g")
	   .attr("class", "axis") //Assign "axis" class
	   .attr("transform", "translate(" + 100 + ",0)")
	   .call(yAxis)

	var tooltip = d3.select("#my_dataviz")
                    .append("div")
                    .style("opacity", 0)
                    .attr("class", "tooltip")

  // A function that change this tooltip when the user hover a point.
  // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
	var mouseover = function(d) {tooltip}
    var mousemove = function(d) {tooltip.html(d["Country/Region"])
                                        .style("left", (d3.mouse(this)[0]+90) + "px") 
                                        .style("top", (d3.mouse(this)[1]) + "px")
                                }
	var mouseleave = function(d) {tooltip.transition()      
	                                     .duration(200)}

  // Add dots
  svg.append('g')
     .selectAll("dot")
     .data(data.filter(function(d,i){return i<50})) 
     .enter()
     .append("circle")
     .attr("cx", function (d) { return xScale(d.Long); } )
     .attr("cy", function (d) { return yScale(d.Lat); } )
     .attr("r", 7)
     .attr("country", function (d) { return d["Country/Region"]})
     .on("mouseover", mouseover)
     .on("mousemove", mousemove)
     .on("mouseleave", mouseleave)
})
