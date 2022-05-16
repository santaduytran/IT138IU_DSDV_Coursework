var rowConverter = function(d) {
		return{
		date: parseFloat (d["4/5/20"]),
		Long: parseFloat(d.Long),
		country: d["Country/Region"] + "-" + d["Province/State"],
		Lat: parseFloat(d.Lat),
		
	};
}

d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv",rowConverter, function(error, data) {
    if (error) {console.log(error);}
    else {console.log(data);

//elininate zero value
var newdata = data.filter(d => d.date > 0);
var w = 2000;
var h = 2000;
var padding = 40;
var svg = d3.select("body")
	        .append("svg")
	        .attr("width", w)
	        .attr("height", h)
	        .append("g");
var x = d3.scaleLinear()
	      .domain([d3.min(newdata, function(d){return d.Long;}) - 10,
		           d3.max(newdata, function(d){return d.Long;}) + 20])
    	  .range([padding, w - padding*2])
var y = d3.scaleLinear()
 	      .domain([d3.min(newdata, function(d){return d.Lat;}) - 20,
		           d3.max(newdata, function(d){return d.Lat;}) + 5])
 	      .range([h - padding, padding])
var size = d3.scaleSqrt()
	         .domain([0, d3.max(newdata, function(d) {return d.date; })])
	         .range([1, 12])
var color = d3.scaleQuantile()
              .domain([d3.min(data, function(d){return d.date;}),
	                   d3.max(data, function(d){return d.date;})])
              .range(d3.schemeCategory20)

//set xAxis
var xAxis = d3.axisBottom() .scale(x);
//set yAxis
var yAxis = d3.axisLeft().scale(y);

svg.append("g")
   .attr("id", "axis_x")
   .attr("transform", "translate(0," + (h - padding) + ")")
   .call(xAxis);
	
svg.append("g")
   .attr("id", "axis_y")
   .attr("transform", "translate(" + padding + ",0)")
   .call(yAxis);

// text label for the x axis
svg.select("#axis_x")
   .append("text")             
   .attr("x", w -20)
   .attr("y", h - 4 )
   .style("text-anchor", "end")
   .text("Long");

// text label for the y axis
svg.select("#axis_y")
   .append("text")
   .attr("text-anchor", "end")
   .attr("transform", "rotate(-90)")
   .attr("y",  w - 1000)
   .attr("x", -10)
   .text("Lat");

var tooltip = d3.select("#vis-container").append("div")
                .attr("class", "tooltip")
		        .style("opacity", 0)
    		    .attr("class", "tooltip")
    		    .style("background-color", "white")
    		    .style("border", "solid")
    		    .style("border-width", "1px")
    		    .style("border-radius", "5px")
    		    .style("padding", "10px")
var mouseover = function(d) {d3.select(this).transition()
                                            .duration('100')
                                            .attr("r",  function(d) {return size(d.date)*5});  	
                             tooltip.transition()
                                    .duration(100)
	                                .style("opacity", 1)
                             tooltip.html("Country: " + d.country + "<br>" + "Confirmed cases: " + d.date)
	                                .style("left", (d3.event.pageX + 10) + "px")
                                    .style("top", (d3.event.pageY - 15) + "px");  
}

var mouseout = function(d) {d3.select(this) 
	                          .transition() 
	                          .duration('200')   
	                          .attr("r",  function(d) {return size(d.date)*4});
//tooltip
    //  .html("Country: " + d.country + "<br>" + "Confirmed cases: " + d.date)
     //.style("right", (d3.mouse(this)[1] +200) + "px") 
     //.style("top", (d3.mouse(this)) + "px")
                            tooltip.transition()
                                   .duration('200')
                                   .style("opacity", 0)}

//svg.append('image')
//	 .attr('xlink:href','https://upload.wikimedia.org/wikipedia/commons/3/38/Worldmap-blank.svg')
//	 .attr('width', w)
//	 .attr('height', h )

  	
var path = svg.append('g')
              .selectAll("circle")
              .data(newdata)
              .enter()
	          .append("circle")
	          .attr("fill", function(d){return color(d.date) })
	          .attr("cx", function(d) {return x(d.Long);})
        	  .attr("cy", function(d) {return  y(d.Lat)})
	          .style("stroke", "red")
    	      .attr("r", function(d) {return size(d.date)*4})
	          .on('mouseover', mouseover)
	          .on("mouseout", mouseout);

// Add brushing
svg.call(d3.brush()                 // Add the brush feature using the d3.brush function
   .extent([ [0,0], [w,h] ]) // Initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
   .on("start brush", updateChart)) // Each time the brush selection changes, trigger the 'updateChart' function
// Function that is triggered when brushing is performed
function updateChart() {
    extent = d3.event.selection
    path.classed("selected", function(d){ return isBrushed(extent, x(d.Long), y(d.Lat) ) } )
  }

// A function that return TRUE or FALSE according if a dot is in the selection or not
function isBrushed(brush_coords, cx, cy) {
       var x0 = brush_coords[0][0],
           x1 = brush_coords[1][0],
           y0 = brush_coords[0][1],
           y1 = brush_coords[1][1];
       return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1; 
};
}
})
