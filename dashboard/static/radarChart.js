
/* Radar chart design created by Nadieh Bremer - VisualCinnamon.com */

////////////////////////////////////////////////////////////// 
//////////////////////// Set-Up ////////////////////////////// 
////////////////////////////////////////////////////////////// 

var margin2 = {top: 100, right: 100, bottom: 100, left: 100},
  width2 = Math.min(400, window.innerWidth - 10) - margin2.left - margin2.right,
  height2 = Math.min(width2, window.innerHeight - margin2.top - margin2.bottom - 20);
  
////////////////////////////////////////////////////////////// 
//////////////////// Draw the Chart ////////////////////////// 
////////////////////////////////////////////////////////////// 

var color = d3.scaleOrdinal()
.range(["#EDC951","#CC333F","#00A0B0"]);

radarChartOptions = {
	w: width2,
	h: height2,
	margin: margin2,
	maxValue: 0.5,
	levels: 5,
	roundStrokes: true,
	color: color,
	indices: [0, 1]
};


/////////////////////////////////////////////////////////
/////////////// The Radar Chart Function ////////////////
/////////////// Written by Nadieh Bremer ////////////////
////////////////// VisualCinnamon.com ///////////////////
/////////// Inspired by the code of alangrafu ///////////
/////////////////////////////////////////////////////////
	
function RadarChart(id, data, filteredData, options) {

	var cfg = {
	 w: 400,				//Width of the circle
	 h: 400,				//Height of the circle
	 margin: {top: 20, right: 20, bottom: 20, left: 20}, //The margins of the SVG
	 levels: 3,				//How many levels or inner circles should there be drawn
	 maxValue: 0, 			//What is the value that the biggest circle will represent
	 labelFactor: 1.5, 	//How much farther than the radius of the outer circle should the labels be placed
	 wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
	 opacityArea: 0.35, 	//The opacity of the area of the blob
	 dotRadius: 4, 			//The size of the colored circles of each blog
	 opacityCircles: 0.1, 	//The opacity of the circles of each blob
	 strokeWidth: 2, 		//The width of the stroke around each blob
	 roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
	 color: d3.scaleOrdinal(d3.schemeCategory10),	//Color function
	 indices: [0, 1] //The indices of the two countries that should be displayed
	};
	
	//Put all of the options into a variable called cfg
	if('undefined' !== typeof options){
	  for(var i in options){
		if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
	  }//for i
	}//if

	var newArray = [];


    let total_hdi = 0;
    let total_lifeexpectancy = 0;
    let total_gni = 0;
    let total_expected_schooling = 0;
    let total_mean_schooling = 0;
    let total_population = 0;
    let total_unemployment = 0;
    let total_happiness = 0;

	for (let i = 0; i < data.length; i++){
		if(cfg.indices.includes(i)) {
			var item = data[i];
			const hdi = item["hdi"] / 0.957;
			const lifeexpectancy = item["lifeexpectancy"] / 83.8;
			const gni = item["gni"] / 72712;
			const expected_schooling = item["expected-schooling"] / 19.8;
			const mean_schooling = item["mean-schooling"] / 14.2;
			const population = item["population"] / 1575.19375;
			const unemployment = item["unemployment"] / 17.31;
			const happiness = item["happiness"] / 7.769;

			newItem = [
				{axis:"hdi",value:hdi},
				{axis:"lifeexpectancy",value:lifeexpectancy},
				{axis:"gni",value:gni},
				{axis:"expected-schooling",value:expected_schooling},
				{axis:"mean-schooling",value:mean_schooling},
				{axis:"population",value:population},
				{axis:"unemployment",value:unemployment},
				{axis:"happiness",value:happiness}
			]

	    	newArray.push(newItem);
		}
	}

	for(var i=0;i<filteredData.length;i++) {
		var item = filteredData[i];
		const hdi = item["hdi"] / 0.957;
		const lifeexpectancy = item["lifeexpectancy"] / 83.8;
		const gni = item["gni"] / 72712;
		const expected_schooling = item["expected-schooling"] / 19.8;
		const mean_schooling = item["mean-schooling"] / 14.2;
		const population = item["population"] / 1575.19375;
		const unemployment = item["unemployment"] / 17.31;
		const happiness = item["happiness"] / 7.769;

	    total_hdi += hdi;
	    total_lifeexpectancy += lifeexpectancy;
	    total_gni += gni;
	    total_expected_schooling += expected_schooling;
	    total_mean_schooling += mean_schooling;
	    total_population += population;
	    total_unemployment += unemployment;
	    total_happiness += happiness;

	};

	const avg_hdi = total_hdi / filteredData.length;
    const avg_lifeexpectancy = total_lifeexpectancy / filteredData.length;
    const avg_gni = total_gni / filteredData.length;
    const avg_expected_schooling = total_expected_schooling / filteredData.length;
    const avg_mean_schooling = total_mean_schooling / filteredData.length;
    const avg_population = total_population / filteredData.length;
    const avg_unemployment = total_unemployment / filteredData.length;
    const avg_happiness = total_happiness / filteredData.length;

    avgItem = [
	    {axis:"hdi",value:avg_hdi},
	    {axis:"lifeexpectancy",value:avg_lifeexpectancy},
	    {axis:"gni",value:avg_gni},
	    {axis:"expected-schooling",value:avg_expected_schooling},
	    {axis:"mean-schooling",value:avg_mean_schooling},
	    {axis:"population",value:avg_population},
	    {axis:"unemployment",value:avg_unemployment},
	    {axis:"happiness",value:avg_happiness}
	    ]

	if((newArray[0][7].value > newArray[1][7].value) && cfg.indices[0] > cfg.indices[1]) {
		temp = newArray[0];
		newArray[0] = newArray[1];
		newArray[1] = temp;
	}

    newArray.push(avgItem);

	data = newArray;
	
	//If the supplied maxValue is smaller than the actual one, replace by the max in the data
	var maxValue = Math.max(cfg.maxValue, d3.max(data, function(i){return d3.max(i.map(function(o){return o.value;}))}));
		
	var allAxis = (data[0].map(function(i, j){return i.axis})),	//Names of each axis
		total = allAxis.length,					//The number of different axes
		radius = Math.min(cfg.w/2, cfg.h/2), 	//Radius of the outermost circle
		Format = d3.format('%'),			 	//Percentage formatting
		angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"
	
	//Scale for the radius
	var rScale = d3.scaleLinear()
		.range([0, radius])
		.domain([0, maxValue]);
		
	/////////////////////////////////////////////////////////
	//////////// Create the container SVG and g /////////////
	/////////////////////////////////////////////////////////

	//Remove whatever chart with the same id/class was present before
	d3.select(id).select("svg").remove();
	
	//Initiate the radar chart SVG
	var svg = d3.select(id).append("svg")
			.attr("width",  cfg.w + cfg.margin.left + cfg.margin.right)
			.attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
			.attr("class", "radar"+id);
	//Append a g element		
	var g = svg.append("g")
			.attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");
	
	/////////////////////////////////////////////////////////
	////////// Glow filter for some extra pizzazz ///////////
	/////////////////////////////////////////////////////////
	
	//Filter for the outside glow
	var filter = g.append('defs').append('filter').attr('id','glow'),
		feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
		feMerge = filter.append('feMerge'),
		feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
		feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');

	/////////////////////////////////////////////////////////
	/////////////// Draw the Circular grid //////////////////
	/////////////////////////////////////////////////////////
	
	//Wrapper for the grid & axes
	var axisGrid = g.append("g").attr("class", "axisWrapper");
	
	//Draw the background circles
	axisGrid.selectAll(".levels")
	   .data(d3.range(1,(cfg.levels+1)).reverse())
	   .enter()
		.append("circle")
		.attr("class", "gridCircle")
		.attr("r", function(d, i){return radius/cfg.levels*d;})
		.style("fill", "#CDCDCD")
		.style("stroke", "#CDCDCD")
		.style("fill-opacity", cfg.opacityCircles)
		.style("filter" , "url(#glow)");

	//Text indicating at what % each level is
	/*
	axisGrid.selectAll(".axisLabel")
	   .data(d3.range(1,(cfg.levels+1)).reverse())
	   .enter().append("text")
	   .attr("class", "axisLabel")
	   .attr("x", 4)
	   .attr("y", function(d){return -d*radius/cfg.levels;})
	   .attr("dy", "0.4em")
	   .style("font-size", "10px")
	   .attr("fill", "#737373")
	   .text(function(d,i) { return Format(1 * d/cfg.levels); });
	*/

	/////////////////////////////////////////////////////////
	//////////////////// Draw the axes //////////////////////
	/////////////////////////////////////////////////////////
	
	//Create the straight lines radiating outward from the center
	var axis = axisGrid.selectAll(".axis")
		.data(allAxis)
		.enter()
		.append("g")
		.attr("class", "axis");
	//Append the lines
	axis.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", function(d, i){ return rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("y2", function(d, i){ return rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2); })
		.attr("class", "line")
		.style("stroke", "white")
		.style("stroke-width", "2px");

	//Append the labels at each axis
	axis.append("text")
		.attr("class", "legend")
		.style("font-size", "11px")
		.attr("text-anchor", "middle")
	   	.attr("fill", "#737373")
		.attr("dy", "0.35em")
		.attr("x", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("y", function(d, i){ return -10 + rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2); })
		.text(function(d){return textMap[d]})
		.call(wrap, cfg.wrapWidth);

	/////////////////////////////////////////////////////////
	///////////// Draw the radar chart blobs ////////////////
	/////////////////////////////////////////////////////////
	
	//The radial line function
	var radarLine = d3.lineRadial()
		.curve(d3.curveLinearClosed)
		.radius(function(d) { return rScale(d.value); })
		.angle(function(d,i) {	return i*angleSlice; });
		
	if(cfg.roundStrokes) {
		radarLine.curve(d3.curveCardinalClosed);
	}
				
	//Create a wrapper for the blobs	
	var blobWrapper = g.selectAll(".radarWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarWrapper");
			
	//Append the backgrounds	
	blobWrapper
		.append("path")
		.attr("class", "radarArea")
		.attr("d", function(d,i) { return radarLine(d); })
		.style("fill", function(d,i) { return cfg.color(i); })
		.style("fill-opacity", cfg.opacityArea)
		.on('mouseover', function (d,i){
			//Dim all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", 0.1); 
			//Bring back the hovered over blob
			d3.select(this)
				.transition().duration(200)
				.style("fill-opacity", 0.7);	
		})
		.on('mouseout', function(){
			//Bring back all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", cfg.opacityArea);
		});
		
	//Create the outlines	
	blobWrapper.append("path")
		.attr("class", "radarStroke")
		.attr("d", function(d,i) { return radarLine(d); })
		.style("stroke-width", cfg.strokeWidth + "px")
		.style("stroke", function(d,i) { return cfg.color(i); })
		.style("fill", "none")
		.style("filter" , "url(#glow)");		
	
	//Append the circles
	blobWrapper.selectAll(".radarCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", "radarCircle")
		.attr("r", cfg.dotRadius)
		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("fill", function(d,i,j) { return cfg.color(j); })
		.style("fill-opacity", 0.8);

	/////////////////////////////////////////////////////////
	//////// Append invisible circles for tooltip ///////////
	/////////////////////////////////////////////////////////
	
	//Wrapper for the invisible circles on top
	var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarCircleWrapper");
		
	//Append a set of invisible circles on top for the mouseover pop-up
	blobCircleWrapper.selectAll(".radarInvisibleCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", "radarInvisibleCircle")
		.attr("r", cfg.dotRadius*1.5)
		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("fill", "none")
		.style("pointer-events", "all")
		.on("mouseover", function(d,i) {
			newX =  parseFloat(d3.select(this).attr('cx')) - 10;
			newY =  parseFloat(d3.select(this).attr('cy')) - 10;
					
			tooltip
				.attr('x', newX)
				.attr('y', newY)
				.text(Format(d.value))
				.transition().duration(200)
				.style('opacity', 1);
		})
		.on("mouseout", function(){
			tooltip.transition().duration(200)
				.style("opacity", 0);
		});
		
	//Set up the small tooltip for when you hover over a circle
	var tooltip = g.append("text")
		.attr("class", "tooltip")
		.style("opacity", 0);
	
	/////////////////////////////////////////////////////////
	/////////////////// Helper Function /////////////////////
	/////////////////////////////////////////////////////////

	//Taken from http://bl.ocks.org/mbostock/7555321
	//Wraps SVG text	
	function wrap(text, width) {
	  text.each(function() {
		var text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.4, // ems
			y = text.attr("y"),
			x = text.attr("x"),
			dy = parseFloat(text.attr("dy")),
			tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
			
		while (word = words.pop()) {
		  line.push(word);
		  tspan.text(line.join(" "));
		  if (tspan.node().getComputedTextLength() > width) {
			line.pop();
			tspan.text(line.join(" "));
			line = [word];
			tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
		  }
		}
	  });
	}//wrap	
	
}//RadarChart

const countries = {
  "Finland": 0,
  "Denmark": 1,
  "Norway": 2,
  "Iceland": 3,
  "Netherlands": 4,
  "Switzerland": 5,
  "Sweden": 6,
  "Austria": 7,
  "Luxembourg": 8,
  "United Kingdom": 9,
  "Ireland": 10,
  "Germany": 11,
  "Belgium": 12,
  "Czech Republic": 13,
  "Malta": 14,
  "France": 15,
  "Spain": 16,
  "Italy": 17,
  "Slovakia": 18,
  "Poland": 19,
  "Lithuania": 20,
  "Slovenia": 21,
  "Romania": 22,
  "Cyprus": 23,
  "Latvia": 24,
  "Estonia": 25,
  "Hungary": 26,
  "Portugal": 27,
  "Russia": 28,
  "Serbia": 29,
  "Moldova": 30,
  "Montenegro": 31,
  "Croatia": 32,
  "Bosnia and Herzegovina": 33,
  "Turkey": 34,
  "Belarus": 35,
  "Greece": 36,
  "North Macedonia": 37,
  "Bulgaria": 38,
  "Albania": 39,
  "Ukraine": 40
};