// set the dimensions and margins of the graph
const margine = { top: 110, right: 120, bottom: 50, left: 150 },
  widthe = 800 - margine.left - margine.right,
  heighte = 400 - margine.top - margine.bottom;

// append the svge object to the body of the page
const svge = d3.select(".ridge-plot")
  .append("svg")
  .attr("width", widthe + margine.left + margine.right)
  .attr("height", heighte + margine.top + margine.bottom)
  .append("g")
  .attr("transform",
    `translate(${margine.left}, ${margine.top})`);

//read data
d3.csv("https://raw.githubusercontent.com/CemZoun/testdemerde/master/data/RidgeData.csv").then(function (data) {

  // Get the different categories and count them
  var categories = ["Oceania", "Europe", "North America", "South America", "Asia", "Africa"]
  var n = categories.length

  // Compute the mean of each group
  allMeans = []
  for (i in categories) {
    currentGroup = categories[i]
    mean = d3.mean(data, function (d) { return +d[currentGroup] })
    allMeans.push(mean)
  }

  // Create a color scale using these means.
  // const myColor = d3.scaleSequential()
  //   .domain([4,7.5])
  //   .interpolator(d3.interpolateViridis);

  const myColor = d3.scaleOrdinal(['#4285F4', '#DB4437', '#F4B400', '#4285F4', '#0F9D58', '#DB4437']);

  // Add X axis
  const x = d3.scaleLinear()
    .domain([2, 8])
    .range([0, widthe]);
  svge.append("g")
    .style('font-size', '10pt')    //PIA ITS HERE
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + heighte + ")")
    .call(d3.axisBottom(x).tickValues([4, 6, 8]).tickSize(-heighte))
    .select(".domain").remove()

  // Add X axis label:
  //   svge.append("text")
  //       .attr("text-anchor", "end")
  //       .attr("x", width)
  //       .attr("y", height + 40)
  //       .text("Probability (%)");

  // Create a Y scale for densities
  const y = d3.scaleLinear()
    .domain([0, 7])
    .range([heighte, 0]);

  // Create the Y axis for names
  const yName = d3.scaleBand()
    .domain(categories)
    .range([0, heighte])
    .paddingInner(1)
  svge.append("g")
    .style('font-size', '12pt')
    .call(d3.axisLeft(yName).tickSize(0))
    .select(".domain").remove()

  // Compute kernel density estimation for each column:
  const kde = kernelDensityEstimator(kernelEpanechnikov(0.3), x.ticks(40)) // increase this 40 for more accurate density.
  const allDensity = []
  for (i = 0; i < n; i++) {
    key = categories[i]
    density = kde(data.map(function (d) { return d[key]; }))
    allDensity.push({ key: key, density: density })
  }

  // Add areas
  svge.selectAll("areas")
    .data(allDensity)
    .join("path")
    .attr("transform", function (d) { return (`translate(0, ${(yName(d.key) - heighte)})`) })
    .attr("fill", function (d) {
      grp = d.key;
      index = categories.indexOf(grp)
      value = allMeans[index]
      return myColor(value)
    })
    .datum(function (d) { return (d.density) })
    .attr("opacity", 0.7)
    .attr("stroke", "#000")
    .attr("stroke-width", 0.1)
    .attr("d", d3.line()
      .curve(d3.curveBasis)
      .x(function (d) { return x(d[0]); })
      .y(function (d) { return y(d[1]); })
    )

})

// This is what I need to compute kernel density estimation
function kernelDensityEstimator(kernel, X) {
  return function (V) {
    return X.map(function (x) {
      return [x, d3.mean(V, function (v) { return kernel(x - v); })];
    });
  };
}
function kernelEpanechnikov(k) {
  return function (v) {
    return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
  };
}