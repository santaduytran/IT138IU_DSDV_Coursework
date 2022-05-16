var rowConverter = function(d) {
    return {
        population : parseFloat(d.population),
        GRDP: parseFloat(d["GRDP-VND"]),
        area: parseFloat(d.area), 
        density: parseFloat(d.density)
    };
}  
 d3.csv("https://tungth.github.io/data/vn-provinces-data.csv",rowConverter , function(error, data) 
{if (error) {console.log(error);}

else {console.log(data);

var w = 700;
var h = 500;
var padding = 40;

var svg = d3.select("body")
	        .append("svg")
	        .attr("width", w)
	        .attr("height", h)
	        .append("g");


var xScale = d3.scaleLinear()
	           .domain([0, d3.max(data, function(d){return d.population;})])
               .range([padding, w - padding*2])
	
	
var yScale = d3.scaleLinear()
 	           .domain([0, d3.max(data, function(d) { return d.GRDP; })])
 	           .range([h - padding, padding])

//set each data point as a circle with its area proportional to the area of the province.
var sizeScale = d3.scaleSqrt()
	              .domain([0, d3.max(data, function(d) { return d.area; })])
	              .range([0, 10])

var colorScale =d3.scaleQuantile()
                  .domain([d3.min(data, function(d) { return d.density; }),
	                       d3.max(data,function(d){return d.density;})
	                      ])
                  .range(d3.schemeCategory20)

//set xAxis
var xAxis = d3.axisBottom() .scale(xScale).ticks(5);
	
svg.append("g")
   .attr("class", "axis") //Assign "axis" class
   .attr("transform", "translate(0," + (h - padding) + ")")
   .call(xAxis);

// text label for the x axis
  svg.append("text")             
     .attr("x", w/2)
     .attr("y", h - 10 )
     .style("text-anchor", "end")
     .text("POPULATION");

//set yAxis
var yAxis = d3.axisLeft().scale(yScale).ticks(5);

svg.append("g")
   .attr("class", "axis")
   .attr("transform", "translate(" + padding + ",0)")
   .call(yAxis);

// text label for the y axis
svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y",  w - 690)
    .attr("x", h - 700)
    .text("GRDP-VND");
  	

svg.append('g')
   .selectAll("circle")
   .data(data)
   .enter()
   .append("circle")
   .attr("fill", function(d){return colorScale(d.density)})
   .attr("cx", function(d) {return xScale(d.population)})
   .attr("cy", function(d) {return yScale(d.GRDP)})
   .attr("r", function(d) {return sizeScale(d.area)})
};
})
