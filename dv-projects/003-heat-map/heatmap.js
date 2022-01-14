const loadData = async () => {
  const url =
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"

  const response = await fetch(url)
  const json = await response.json()
  return json
}

const doPlot = async () => {
  const { baseTemperature: baseTemp, monthlyVariance: dataset } =
    await loadData()

  const getTooltipText = (d) => {
    let monthText = new Date(1970, d.month - 1, 1).toLocaleString("default", {
      month: "long",
    })
    return `${d.year} -  ${monthText}<br />Actual Temp.:${(baseTemp + d.variance).toFixed(
      2
    )}°C<br />Variance: ${d.variance.toFixed(2)}°C`
  }

  const minTemp = Math.floor( d3.min(dataset, (d) => d["variance"]) + baseTemp  )
  const maxTemp = Math.ceil(d3.max(dataset, (d) => d["variance"]) + baseTemp )
  

  const w = 1200
  const h = 550

  const xPadding = 100
  const yPadding = 50

  const legendH = 100

  const years = [...new Set(dataset.map((i) => i.year))]
  const barWidth = Math.ceil((w - 2 * xPadding) / years.length)
  const barHeight = 30

  const svg = d3.select("main").append("svg").attr("width", w).attr("height", h)

  const tooltip = d3
    .select("main")
    .append("div")
    .attr("id", "tooltip")
    .attr("visibility", "hidden")
    .html("Something?")

  const minYear = d3.min(dataset, (d) => d.year)
  const maxYear = d3.max(dataset, (d) => d.year)
  const minMonth = 1

  // update description
  document.getElementById(
    "description"
  ).innerHTML = `${minYear} - ${maxYear}: base temperature ${baseTemp}°C`

  // const filledColors = [ '#4575B4',  '#74ADD1' , '#ABD9E9' , '#FFFFBF' , '#FEE090' , '#FDAE61' , '#F46D43' , '#D73027']
  const filledColors = [
    "#CCFF33",
    "#74ADD1",
    "#ABD9E9",
    "#FFFFBF",
    "#FEE090",
    "#FDAE61",
    "#F46D43",
    // "#D73027",
  ]
  const step = (maxTemp - minTemp) / filledColors.length

  const domain = filledColors.map((i, k) => minTemp + (k * step))
  const range = filledColors.map((i, k) =>  k * step)
  const vScale = d3.scaleLinear().domain(domain).range(filledColors)

  svg
    .selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("x", (d) => (d.year - minYear) * barWidth)
    .attr("y", (d) => (d.month - minMonth) * barHeight)
    .attr("width", barWidth)
    .attr("height", barHeight)
    .attr("transform", `translate( ${xPadding} , ${yPadding})`)
    .attr("data-year", (d) => d.year)
    .attr("data-month", (d) => d.month - minMonth)
    .attr("data-temp", (d) => baseTemp + d.variance)
    .style("fill", (d) => { 
      return vScale(d.variance + baseTemp)
    })
    .on("mouseover", (e, d) => {
      tooltip.style("visibility", "visible")
      tooltip.style("left", `${e.clientX + 20}px`)
      tooltip.style("top", `${(d.month - minMonth) * barHeight}px`)      
      tooltip.attr("data-year", d.year)
      tooltip.html(getTooltipText(d))
    })
    .on("mouseout", (e, d) => {
      tooltip.style("visibility", "hidden")
    })
    

  const yScale = d3
    .scaleTime()
    .domain([new Date(1970, 0, -15), new Date(1970, 11, 15)])
    .range([yPadding, yPadding + 12 * barHeight])
  const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%B"))

  svg
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate( ${xPadding - 2} , 0) `)
    .attr("fill", "black")
    .call(yAxis)

  const xScale = d3
    .scaleTime()
    .domain([new Date(d3.min(years), 0, 01), new Date(d3.max(years), 0, 1)])
    .range([xPadding, xPadding + barWidth * years.length])

  //   const xScale = d3
  //     .scaleTime()
  //     .domain([
  //       new Date(d3.min(dataset, (d) => d["Year"]) - 1, 0, 1),
  //       new Date(d3.max(dataset, (d) => d["Year"]) + 1, 0, 1),
  //     ])
  //     .range([xPadding, xPadding + barWidth * years.length])
  //     .tickFormat(d3.timeFormat("%Y"))

  const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y"))

  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("fill", "black")
    .attr(
      "transform",
      `translate( 0, ${h - yPadding + barHeight / 2 - legendH - 5}) `
    )
    .call(xAxis)

  const legendBox = svg.append("g").attr("id", "legend")

  const legend = legendBox
    .selectAll("#legend")
    .data(domain)
    .enter()
    .append("g")
    .attr("class", "legend")

  const legendHeight = 50
  legend
    .append("rect")
    .attr("fill", (d, i) => filledColors[i])
    .attr("x", (d, i) => xPadding + (i * legendHeight))
    .attr("y", h - legendH / 2 - legendHeight / 2 - 10)
    .attr("width", legendHeight )
    .attr("height", legendHeight)
    .attr('transform' , `translate( ${legendHeight } , 0)`)

  

  const lScale = d3
    .scaleLinear()    
    // .domain(domain)
    .domain( [ d3.min(domain) - step, d3.max(domain) + step ] )
    .range([minTemp, (domain.length  + 1) * legendHeight ])
    
    
    
    let  ticks = domain.map( (i,k) => minTemp + (k * step))
    let dummy = ticks[ticks.length - 1] + step
    ticks = [ ...ticks, dummy , dummy ]
    
    
    

    const legendAxis = d3.axisBottom(lScale)    
    .tickValues( ticks )
    .tickFormat( d => parseFloat(d).toFixed(2))
    
  svg
    .append("g")
    .attr("id", "legend-axis")
    .attr("transform", `translate( ${xPadding } , ${h - 35})`)
    .call(legendAxis)
}

doPlot()
