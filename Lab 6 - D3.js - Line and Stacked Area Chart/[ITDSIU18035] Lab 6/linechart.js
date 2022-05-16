var rowConverter = function(d) {
return {
	country: d.Countries,
    date: new Date(d.Date),
	sickcase: parseInt(d.Case)
 };
}
//import data
d3.csv("https://raw.githubusercontent.com/dangquanghung/covid/master/WorldCovid.csv",rowConverter, function(error, data) {
    if (error) {console.log(error);}
    else {console.log(data);
	var formatTime = d3.timeFormat("%m/%d/%Y");
	var w = 1024;
	var h = 700;
	var padding = 60;
	
	var nested = d3.nest().key(function(d) { return d.country; }).entries(data);
	console.log(nested);
	
	var keys = ["US", "Vietnam", "France", "Italy"]


	var x = d3.scaleTime()
			  .domain(d3.extent(data, function(d) {return d.date;}))
			  .range([padding, w - padding]);
				
	var y = d3.scaleLinear()
			  .domain([d3.min(data, function(d) {return d.sickcase;}),
					   d3.max(data, function(d) {return d.sickcase;})])
			  .range([h - padding, padding]);
				
	var color = d3.scaleOrdinal()
				  .domain(keys)
				  .range(["violet", "red" , "#5965A3", "blue"]);
									   
	var line = d3.line()
				 .x(function(d) {return x(d.date);})
				 .y(function(d) {return y(d.sickcase);})
				 .curve(d3.curveBasis);
							
	var svg = d3.select("body")
			    .append("svg")
				.attr("width", w)
				.attr("height", h);
	var focusText = svg.append('g')
					   .append('text')
					   .style("opacity", 0)
					   .attr("text-anchor", "left")
					   .attr("alignment-baseline", "middle")
	// Text label for the y axis
	svg.append("text")
	   .attr("text-anchor", "end")
	   .attr("transform", "rotate(-0)")
	   .attr("y",  w - 980)
	   .attr("x", h - 600)
	   .text("Confirmed case");
							
				
	// Create lines
	var legend = svg.selectAll("line")
					.data(nested)
					.enter()
					.append("path")
					.attr("class","legend")
					.attr("fill", "none")
					.attr("stroke-width", 1.5)
					.attr("stroke", function(d) {return color(d.key)})
					.attr("d", function(d){return line(d.values)});
	svg.selectAll("dot")
	   .data(keys)
	   .enter()
	   .append("circle")
	   .attr("cx", 150)
	   .attr("cy", function(d,i){ return 80 + i*25}) // 80 is where the first dot appears. 25 is the distance between dots
       .attr("r", 7)
	   .style("fill", function(d){ return color(d)})
		
	svg.selectAll("mylabels")
	   .data(keys)
	   .enter()
	   .append("text")
       .attr("x", 170)
	   .attr("y", function(d,i) {return 80 + i*25}) // 80 is where the first dot appears. 25 is the distance between dots
	   .style("fill", function(d) { return color(d)})
	   .text(function(d){return d})
	   .attr("text-anchor", "left")
	   .style("alignment-baseline", "middle");
				
	var mouseG = svg.selectAll('.mouse-per-line')
					.data(nested)
	mouseG.on('mousemove', function () {
              var mouse = d3.mouse(this)
              updateTooltip(mouse, nested)
            })
    }
	var	tooltip = d3.select("body").append("svg")
                    .attr('id', 'tooltip')
                    .style('position', 'absolute')
                    .style("background-color", "#D3D3D3")
                    .style('padding', 6)
                    .style('display', 'none')
	mouseG = svg.append("g")
				.attr("class", "mouse-over-effects");
    mouseG.append("path") // create vertical line to follow mouse
          .attr("class", "mouse-line")
          .style("stroke", "#A9A9A9")
	      .style("stroke-width", "2px")
          .style("opacity", "0");
	var lines = document.getElementsByClassName('line');
	var mousePerLine = mouseG.selectAll('.mouse-per-line')
                             .data(nested)
                             .enter()
                             .append("g")
                             .attr("class", "mouse-per-line");
    mousePerLine.append("circle")
                .attr("r", 6)
                .style("stroke", function (d) {return color(d.key)})
                .style("fill", "none")
                .style("stroke-width", "2px")
                .style("opacity", "0");
	mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
          .attr('width', w) 
          .attr('height', h)
          .attr('fill', 'none')
          .attr('pointer-events', 'all')
          .on('mouseout', function () { // on mouse out hide line, circles and text
              d3.select(".mouse-line")
                .style("opacity", "0");
              d3.selectAll(".mouse-per-line circle")
                .style("opacity", "0");
              d3.selectAll(".mouse-per-line text")
                .style("opacity", "0");
              d3.selectAll("#tooltip")
                .style('display', 'none')
            })
          .on('mouseover', function () { // on mouse in show line, circles and text
              d3.select(".mouse-line")
                .style("opacity", "1");
              d3.selectAll(".mouse-per-line circle")
                .style("opacity", "1");
              d3.selectAll("#tooltip")
                .style('display', 'block')
            })
	      .on('mousemove', function () { // update tooltip content, line, circles and text when mouse moves
              var mouse = d3.mouse(this)
              d3.selectAll(".mouse-per-line")
                .attr("transform", function (d, i) {
                            var xDate = x.invert(mouse[0]) // use 'invert' to get date corresponding to distance from mouse position relative to svg
                            var bisect = d3.bisector(function (d) { return d.date; }).left // retrieve row index of date on parsed csv
                            var idx = bisect(d.values, xDate);				  
			  d3.select(".mouse-line")
                .attr("d", function () {
                            var dataset = "M" + x(d.values[idx].date) + "," + (h);
                                          dataset += " " + x(d.values[idx].date) + "," + 0;
                            return dataset;
                });
               return "translate(" + x(d.values[idx].date) + "," + y(d.values[idx].sickcase) + ")";
                });
			   updateTooltip(mouse, nested)
            })
			
			function updateTooltip(mouse, nested) {
				Obj = []
			nested.map(function(d) {
			var xDate = x.invert(mouse[0])
			var bisect = d3.bisector(function (d) { return d.date; }).left
			var idx = bisect(d.values, xDate)
				Obj.push({key: d.values[idx].country, Case: d.values[idx].sickcase, date: d.values[idx].date })
		  
		  console.log(Obj)
		  
		  tooltip.transition()
				.duration(100)
				.style("opacity", 1)

        tooltip.html("Country: " + Obj[0].key + "-" + "Confirmed cases: " + d.Case )
          .style('display', 'block')
          .style('left', (d3.event.pageX + 20) + "px")
          .style('top', (d3.event.pageY - 20) + "px")
          .style('font-size', 11.5)
          .selectAll()
          .data(Obj).enter() 
          .append('body')
          .style('color', function(d) {
            return color(d.key)
			
          })
	})  								
		  //Create axes
				xAxis = d3.axisBottom().scale(x).tickFormat(formatTime);
				
				yAxis = d3.axisLeft().scale(y);
				
				svg.append("g")
					.attr("transform", "translate(0," + (h - padding) + ")")
					.call(xAxis);
				svg.append("g")
					.attr("transform", "translate(" + padding + ",0)")
					.call(yAxis);
 
 };
 })
  

 
 