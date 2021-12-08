// set the dimensions and margins of the graph
const margin = { top: 60, right: 230, bottom: 60, left: 30 },
  width = 1500 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#bubble")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);


const tooltip = d3.select("#bubble")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "black")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("color", "white")

textMap = {
    "rank": "Rank",
    "gdp": "Logged GDP per capita",
    "social-support": "Social Support",
    "healthy-life-expectancy": "Healthy Life Expectancy",
    "choices": "Freedom to Make Life Choices",
    "generosity": "Generosity",
    "corruption": "Perception of Corruption",
    "hdi": "Human Development Index",
    "lifeexpectancy": "Life Expectancy (years)",
    "gni": "GNI (dollar / capita)",
    "expected-schooling": "Expected Years of Schooling",
    "mean-schooling": "Mean Years of Schooling",
    "population": "Population Density (people / km²)",
    "unemployment": "Unemployment rate (%)",
    "happiness": "Happiness Score",
}

var minX = 0;
var maxX = 0;
var minY = 0;
var maxY = 0;

//Read the data
d3.json('./api/data').then((d) => {

  // ---------------------------//
  //       AXIS  AND SCALE      //
  // ---------------------------//

  var selectX = document.getElementById("xFeature");
  var selectY = document.getElementById("yFeature");

  var features = Object.keys(d[0]);
  var features = features.filter(function(e) { return e !== 'country' })

  var xFeature = "gni";
  var yFeature = "lifeexpectancy";

  for(index in features) {
      selectX.options[selectX.options.length] = new Option(textMap[features[index]], features[index]);
      selectY.options[selectY.options.length] = new Option(textMap[features[index]], features[index]);
  }

  selectX.value = "gni";
  selectY.value = "lifeexpectancy";

  selectX.addEventListener('change', function() {
    xFeature = this.value;
    PlotBubble(filterData(), xFeature, yFeature, true);
  });

  selectY.addEventListener('change', function() {
    yFeature = this.value;
    PlotBubble(filterData(), xFeature, yFeature, true);
  });

  PlotBubble(data, xFeature, yFeature, true);
  
  })

function PlotBubble(data, xFeature, yFeature, updateAxis) {

  svg.selectAll("*").remove();

  var xFeature_list = data.map(d => d[xFeature]);
  var yFeature_list = data.map(d => d[yFeature]);

  if(updateAxis) {
    minX = Math.min.apply(Math, xFeature_list) - 0.1 * Math.min.apply(Math, xFeature_list);
    maxX = Math.max.apply(Math, xFeature_list) + 0.1 * Math.min.apply(Math, xFeature_list);
    minY = Math.min.apply(Math, yFeature_list) - 0.05 * Math.min.apply(Math, yFeature_list);
    maxY = Math.max.apply(Math, yFeature_list) + 0.05 * Math.min.apply(Math, yFeature_list);
  }  

  // Add X axis
  const x = d3.scaleLinear()
    .domain([minX, maxX])
    .range([ 0, width ]);
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).ticks(3));

  // Add X axis label:
  svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height+50 )
      .text(textMap[xFeature]);

  // Add Y axis
  const y = d3.scaleLinear()
    .domain([minY, maxY])
    .range([ height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Add Y axis label:
  svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", 0)
      .attr("y", -20 )
      .text(textMap[yFeature])
      .attr("text-anchor", "start");

  // Add a scale for bubble size
  const z = d3.scaleSqrt()
    .domain([3.5, 7.769])
    .range([0, 25]);

  // Add a scale for bubble color

  const myColor = d3.scaleOrdinal()
                    .domain([0, 1 , 2, 3, 4])
                    .range(["#4285F4", "#DB4437", "#F4B400", "#0F9D58", "#ff8000"]);

  // ---------------------------//
  //      TOOLTIP               //
  // ---------------------------//

  // -1- Create a tooltip div that is hidden by default:

  // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
  const showTooltip = function (event, d) {
    tooltip
      .transition()
      .duration(200)
    tooltip
      .style("opacity", 1)
      .html("Country: " + d.country + ", Happiness: " + d.happiness)
      .style("left", (event.x) / 2 + "px")
      .style("top", (event.y) / 2 - 50 + "px")
  }
  const moveTooltip = function (event, d) {
    tooltip
      .style("left", (event.x) / 2 + "px")
      .style("top", (event.y) / 2 - 50 + "px")
  }
  const hideTooltip = function (event, d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
  }


  // ---------------------------//
  //       HIGHLIGHT GROUP      //
  // ---------------------------//

  // What to do when one group is hovered
  const highlight = function (event, d) {
    // reduce opacity of all groups
    d3.selectAll(".bubbles").style("opacity", .05)
    // expect the one that is hovered
    d3.selectAll(".bubbles.bubbles-" + d).style("opacity", 1)
  }

  // And when it is not hovered anymore
  const noHighlight = function (event, d) {
    d3.selectAll(".bubbles").style("opacity", 1)
  }


  // ---------------------------//
  //       CIRCLES              //
  // ---------------------------//

  // Add dots
  svg.append('g')
    .selectAll("dot")
    .data(data)
    .join("circle")
    .attr("class", function(d) { return "bubbles bubbles-" + Math.floor(d.rank / 39)})
    .attr("cx", d => x(d[xFeature]))
    .attr("cy", d => y(d[yFeature]))
    .attr("r", d => z(d.happiness))
    .style("fill", d => myColor(Math.floor(d.rank / 39)))
    .attr("stroke", "black")
    // -3- Trigger the functions for hover
    .on("mouseover", showTooltip )
    .on("mousemove", moveTooltip )
    .on("mouseleave", hideTooltip )



    // ---------------------------//
    //       LEGEND              //
    // ---------------------------//

    // Add legend: circles
    const valuesToShow = [4, 6, 8]
    const xCircle = 1350
    const xLabel = 1400
    svg
      .selectAll("legend")
      .data(valuesToShow)
      .join("circle")
        .attr("cx", xCircle)
        .attr("cy", d => height - 100 - z(d))
        .attr("r", d => z(d))
        .style("fill", "none")
        .attr("stroke", "black")

    // Add legend: segments
    svg
      .selectAll("legend")
      .data(valuesToShow)
      .join("line")
        .attr('x1', d => xCircle + z(d))
        .attr('x2', xLabel)
        .attr('y1', d => height - 100 - z(d))
        .attr('y2', d => height - 100 - z(d))
        .attr('stroke', 'black')
        .style('stroke-dasharray', ('1,1'))

    // Add legend: labels
    svg
      .selectAll("legend")
      .data(valuesToShow)
      .join("text")
        .attr('x', xLabel)
        .attr('y', d => height - 100 - z(d))
        .text( d => d)
        .style("font-size", "10px")
        .attr('alignment-baseline', 'middle')

    // Legend title
    svg.append("text")
      .attr('x', xCircle)
      .attr("y", height - 100 +30)
      .text("Happiness Score")
      .attr("text-anchor", "middle")

    // Add one dot in the legend for each name.
    const size = 20
    const allgroups = [0,1,2,3,4]
    svg.selectAll("myrect")
      .data(allgroups)
      .join("circle")
        .attr("cx", 1300)
        .attr("cy", (d,i) => 10 + i*(size+5)) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", d =>  myColor(d))
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

    // Add labels beside legend dots
    svg.selectAll("mylabels")
      .data(allgroups)
      .enter()
      .append("text")
        .attr("x", 1300 + size*.8)
        .attr("y", (d,i) =>  i * (size + 5) + (size/2)) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", d => myColor(d))
        .text(d => `${(20*(5-d)).toString()} - ${(20*(4-d)).toString()} %`)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

}