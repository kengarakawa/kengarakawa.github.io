const loadData = async () => {
  const urls = {
    video_games_sales:
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json",
    kickstarter_pledges:
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json",
    movie_sales:
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json",
  }

  const response = await fetch(urls["video_games_sales"])
  const json = await response.json()

  document.getElementById("description").innerHTML = json.name
  return makeGamesSalesTree(json)
}
const selected = {}
var selectedIndex = 0
const getColor = (variance) => {
  const mySwatches = [
    "#445A67",
    "#57838D",
    "#B4C9C7",
    "#F3BFB3",
    "#CCADB2",
    "#50B4DB",
    "#9EDDEF",
    "#F7E5B7",
    "#D7E2EA",
    "#96B3C2",
    "#C29BA3",
    "#E3BFB7",
    "#FFE4C9",
    "#B7EAF7",
    "#8A9BA7",
    "#FC6238",
    "#E7C582",
    "#0065A2",
    "#FF60A8",
  ]

  if (selected[variance] === undefined) {
    selected[variance] = mySwatches[selectedIndex]
    selectedIndex++
  }

  return selected[variance]
}

const makeGamesSalesTree = (data) => {
  let out = {
    name: data.name,
    colname: "level1",
    children: [],
  }

  let output = data.children.reduce(
    (acc, consoleObj) => {
      let consoleIndex = acc.children.findIndex((d) => d === consoleObj.name)
      // console not found , create new node then
      if (consoleIndex === -1) {
        acc.children.push({
          name: consoleObj.name,
          children: [],
          colname: "level2",
          sums: 0,
        })
        consoleIndex = acc.children.length - 1
      }

      consoleObj.children.map((game) => {
        let me = {
          name: game.name,
          colname: "level3",
          value: game.value,
        }
        acc.children[consoleIndex].children.push(me)
        acc.children[consoleIndex].sums += parseFloat(game.value)
      })

      return acc
    },
    {
      name: data.name,
      colname: "level1",
      children: [],
    }
  )

  return output
}

const loadDummyData = async () => {
  const response = await fetch("test.json")
  return await response.json()
}

const doPlot = async () => {
  const dataset = await loadData()

  const w = 800
  const h = 800
  const lw = 200

  let margin = { top: 10, right: 10, bottom: 10, left: 10 },
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom

  const tooltip = d3.select("main").append("tooltip").attr("id", "tooltip")

  // append the svg object to the body of the page
  const svg = d3
    .select("main")
    .append("svg")
    .attr("width", w + lw)
    .attr("height", h)
  // .append("g")
  // .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  // read json data

  let root = d3
    .hierarchy(dataset)
    .sum((d) => d.value)
    .sort((a, b) => a.value < b.value)

  d3.treemap().size([width, height]).padding(2)(root)

  svg
    .selectAll("rect")
    .data(root.leaves())
    .enter()
    .append("rect")
    .attr("class", "tile")
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .style("stroke", "black")
    .style("fill", (d, k) => {
      // if is at game level, fill color based on parent
      if (d.depth === 2) {
        return getColor(d.parent.data.name)
      }

      return "teal"
    })
    .attr("data-name", (d) =>
      d.data.name === undefined ? "(unknown)" : d.data.name
    )
    .attr("data-category", (d) =>
      d.parent.data.name === undefined ? "(unknown)" : d.parent.data.name
    )
    .attr("data-value", (d) => d.value)
    .on("mouseover", (e, d) => {
      tooltip
        .html(
          `Name: ${d.data.name}<br />Category: ${d.parent.data.name}<br />Value: ${d.data.value}`
        )
        .style("top", `${e.clientY}px`)
        .style("left", `${e.clientX + 20}px`)
        .style("visibility", "visible")
        .attr("data-value", d.data.value)
    })
    .on("mouseout", (e, d) => {
      tooltip.style("visibility", "hidden")
    })

  svg
    .selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
    .attr("class", "first")
    .attr("transform", (d) => `translate(${d.x0} , ${d.y0})`)
    .selectAll("tspan")
    .data((d) => d.data.name.split(/\s/g))
    .enter()
    .append("tspan")
    .attr("x", (d) => 5)
    .attr("y", (d, i) => 15 + i * 10)
    .text((d) => d)
    .attr("font-size", "10px")
    .attr("fill", "black")

  // legends
  let legends = Object.keys(selected).map((k) => {
    return { name: k, color: selected[k] }
  })

  const legendBox = svg.append("g").attr("id", "legend")

  const legend = legendBox
    .selectAll("#legend")
    .data(legends)
    .enter()
    .append("g")
    .attr("class", "legendXXX")

  legend
    .append("rect")
    .attr("class", "legend-item")
    .attr("x", 30)
    .attr("y", (d, i) => i * 30 + 50)
    .attr("width", 20)
    .attr("height", 20)
    .attr("stroke", "#000")
    .attr("fill", (d) => d["color"])
    .attr("transform", `translate( ${w} , 0)`)

  legend
    .append("text")
    .attr("class", "legend-text")
    .attr("x", 65)
    .attr("y", (d, i) => i * 30 + 63)
    .text((d) => d["name"])
    .attr("transform", `translate( ${w} , 0)`)
}

doPlot()
