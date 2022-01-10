const readData = async () => {
  const url =
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
  const res = await fetch(url)
  const json = await res.json()
  return json.map((e) => {
    const mmss = e.Time.split(":")
    e.timestamp = new Date(1970, 0, 1, 0, mmss[0], mmss[1])
    return { ...e }
  })
}

const getToolTipText = (data) => {
  return (
    `${data["Name"]} - ${data["Nationality"]}<br />
Year: ${data["Year"]} Time: ${data["Time"]}` +
    (data["Doping"] === "" ? "" : `<br /><br />${data["Doping"]}`)
  )
}

const doPlot = async () => {
  const dataset = await readData()

  const w = 800
  const h = 500
  const lw = 300

  const radius = 10
  const padding = 80

  const xScale = d3
    .scaleTime()
    .domain([
      new Date(d3.min(dataset, (d) => d["Year"]) - 1, 0, 1),
      new Date(d3.max(dataset, (d) => d["Year"]) + 1, 0, 1),
    ])
    .range([padding, w - padding])

  const yScale = d3
    .scaleTime()
    .domain([
      d3.min(dataset, (d) => d.timestamp),
      d3.max(dataset, (d) => d.timestamp),
    ])
    .range([h - padding, padding])

  const svg = d3
    .select("main")
    .append("svg")
    .attr("width", w + lw)
    .attr("height", h)

  const tooltip = d3.select("body").append("div").attr("id", "tooltip")

  svg
    .selectAll("circle")
    .data(dataset)
    .enter()

    .append("circle")
    .attr("cx", (d) => {
      let years = new Date(`${d["Year"]}-01-01`)
      return xScale(years)
    })
    .attr("cy", (d) => {
      return yScale(d["timestamp"])
    })
    .attr("r", radius)    
    .attr("data-xvalue", (d) => d["Year"])
    .attr("data-yvalue", (d) => d.timestamp)
    .on("mouseover", (e, d) => {
      tooltip.style("visibility", "visible")
      tooltip.style("left", `${e.clientX + 20}px`)
      tooltip.style("top", `${yScale(d["timestamp"]) + padding + 100}px`)
      tooltip.html(getToolTipText(d))
      tooltip.attr("data-year", d["Year"])
    })
    .on("mouseout", (e, d) => {
      tooltip.style("visibility", "hidden")
    })

    .attr("class", (d) => (d["Doping"] === "" ? "dot nope" : "dot dope"))
  
  // axes
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y"))
  const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S"))

  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0 , ${h - padding}) `)
    .call(xAxis)

  svg
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${padding} , 0) `)
    .call(yAxis)

  // legend
  const legendBox = svg.append("g").attr("id", "legend")
  const legends = [
    {
      class: "nope",
      text: "No doping allegations",
    },
    {
      class: "dope",
      text: "Riders with doping allegations",
    },
  ]

  const legend = legendBox
    .selectAll("#legend")
    .data(legends)
    .enter()
    .append("g")
    .attr("class", "legend-label")

  legend
    .append("rect")
    .attr("x", w + 10)
    .attr("y", (d, i) => 150 + i * 60)
    .attr("class", (d) => `leg ${d.class}`)
    .attr("width", 20)
    .attr("height", 20)

  legend
    .append("text")
    .attr("x", w + 50)
    .attr("y", (d, i) => 150 + 15 + i * 60)
    .text((d) => d.text)
    
  // yaxis title
  svg
    .append("text")
    .text("Time in Minutes")
    .attr("x", padding - 50)
    .attr("y", padding - 10)
    .attr('font-style' , 'italic')
    
}

doPlot()
