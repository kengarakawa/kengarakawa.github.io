const getTooltipText = (item) => {
  return `${item.area_name} , ${item.state} ... ${item.bachelorsOrHigher}%`
}

const loadData = async () => {
  const EDU_DATA =
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
  const CTY_DATA =
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"

  const [edu_json, cty_json] = await Promise.all([
    fetch(EDU_DATA).then((response) => response.json()),
    fetch(CTY_DATA).then((response) => response.json()),
  ])

  // apply topojson
  let countyData = topojson.feature(
    cty_json,
    cty_json.objects.counties
  ).features

  // map both  data into single item
  return countyData.map((i) => {
    let match = edu_json.find((cty) => cty.fips == i.id)
    return { ...i, ...match }
  })
}

const doPlot = async () => {
  const dataset = await loadData()

  const w = 1000
  const h = 550

  const lw = 200

  const canvas = d3
    .select(".canvas-container")
    .append("svg")
    .attr("width", w + lw)
    .attr("height", h)

  const tooltip = d3.select("#tooltip")
  const colors = ["violet", "blue", "green", "yellow", "orange", "red"]

  let minDataset = d3.min(dataset, (d) => d.bachelorsOrHigher)
  let maxDataset = d3.max(dataset, (d) => d.bachelorsOrHigher)

  let idealMin = Math.floor((minDataset + 1) / 10) * 10
  let idealMax = Math.ceil((maxDataset + 1) / 10) * 10
  let steps = (idealMax - idealMin) / colors.length
  const domain = colors.map((item, k) => {
    return k * steps
  })

  const cScale = d3.scaleLinear().domain(domain).range(colors)

  canvas
    .selectAll("path")
    .data(dataset)
    .enter()
    .append("path")
    .attr("d", d3.geoPath())
    .attr("class", "county")
    .attr("fill", (d) => cScale(d.bachelorsOrHigher))
    .attr("data-fips", (d) => d.fips)
    .attr("data-education", (d) => d.bachelorsOrHigher)
    .on("mouseover", (e, d) => {
      tooltip.html(getTooltipText(d))
      tooltip.style("visibility", "visible")
      tooltip.style("left", `${e.clientX + 20}px`)
      tooltip.style("top", `${e.clientY + 20}px`)
      tooltip.attr("data-education", d.bachelorsOrHigher)
    })
    .on("mouseout", (e, d) => {
      tooltip.style("visibility", "hidden")
    })

  canvas
    .append("g")
    .attr("id", "legend")
    .selectAll("#legend")
    .data(domain)
    .enter()
    .append("rect")
    .attr("class", "legend-item")
    .attr("fill", (d, i) => colors[i])
    .attr("x", w)
    .attr("y", (d, i) => {
      return i * 50 + 50
    })
    .attr("width", 10)
    .attr("height", 50)
    
  // legend text includes lower range & upper range  
  const legendText = [ idealMin, ...domain , idealMax ]

  canvas
    .selectAll("#legend")
    .data(legendText)
    .enter()
    .append("text")
    .attr('class' , 'legend-text')
    .attr('fill' , 'black')
    .attr('x' , w  + 20 )
    .attr("y", (d, i) => {
        return (i - 1) * 50 + 55
      })
    .text( d => d.toFixed(2) )
    
}
doPlot()
