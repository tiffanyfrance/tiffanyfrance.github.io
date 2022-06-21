function drag(simulation) {

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}

function linkArc(d) {
  const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
  return `
    M${d.source.x},${d.source.y}
    A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
  `;
}

let width = window.innerWidth;
let height = window.innerHeight;

// d3.csv('seagrass.csv').then(data => {
//   let keys = d3.keys(data[0]);
//   keys.shift();

//   let csvStr = `source,target,amount\n`

//   for(let d of data) {
//     for(let key of keys) {
//       if(d[key]) {
//         let source = key;
//         let target = d.Name;
//         let amount = +d[key];
//         csvStr += `${source},${target},${amount}\n`;
//       }
//     }
//   }

//   console.log(csvStr);
// });

// d3.csv('suits.csv').then(linksCSV => {
d3.csv('seagrass-links.csv').then(linksCSV => {
  console.log(linksCSV)
  let types = Array.from(new Set(linksCSV.map(d => d.type)));

  let color = d3.scaleOrdinal(types, d3.schemeCategory10);

  let data = ({ nodes: Array.from(new Set(linksCSV.flatMap(l => [l.source, l.target])), id => ({ id })), links: linksCSV });

  const links = data.links.map(d => Object.create(d));
  const nodes = data.nodes.map(d => Object.create(d));

  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id))
    .force("charge", d3.forceManyBody().strength(-700))
    .force("x", d3.forceX())
    .force("y", d3.forceY());

  const svg = d3.select('body').append('svg')
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .style("font", "12px sans-serif");

  // Per-type markers, as they don't inherit styles.
  svg.append("defs").selectAll("marker")
    .data(types)
    .join("marker")
    .attr("id", d => `arrow-${d}`)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -0.5)
    .attr("markerWidth", 8)
    .attr("markerHeight", 8)
    .attr("orient", "auto")
    .append("path")
    // .attr("fill", color)
    .attr("fill", "red")
    .attr("d", "M0,-5L10,0L0,5");

  const link = svg.append("g")
    .attr("fill", "none")
    .attr("stroke-width", 1)
    .selectAll("path")
    .data(links)
    .join("path")
    // .attr("stroke", d => color(d.type))
    .attr("stroke", "#ddd")
    .attr("marker-end", d => `url(${new URL(`#arrow-${d.type}`, location)})`);

  const node = svg.append("g")
    .attr("fill", "currentColor")
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .selectAll("g")
    .data(nodes)
    .join("g")
    .call(drag(simulation));

  node.append("circle")
    .attr("stroke", "white")
    .attr("stroke-width", 1.5)
    .attr("r", 4);

  node.append("text")
    .attr("x", 8)
    .attr("y", "0.31em")
    .text(d => d.id)
    .clone(true).lower()
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-width", 3);

  simulation.on("tick", () => {
    link.attr("d", linkArc);
    node.attr("transform", d => `translate(${d.x},${d.y})`);
  });
})
