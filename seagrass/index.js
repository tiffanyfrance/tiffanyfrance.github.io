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
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
}

function linkArc(d) {
  const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
  return `
    M${d.source.x},${d.source.y}
    A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
  `;
}

let color = d3.scaleLinear()
  // .domain([0, 1, 2, 3, 4])
  // .range(['#1FA3A3', '#23AD54', '#70AA2D', '#99CC33', '#ffca04'])
  // .range(['#e9cc15', '#99CC33', '#70AA2D', '#23AD54', '#1FA3A3'])
  .domain([0,1,2,3,4,5])
  .range(['orange', '#DDDD3C', '#70AA2D', '#1FA3A3', '#6B7FD1', '#127717'])
  .interpolate(d3.interpolateHcl);

// var color = d3.scaleOrdinal(d3.schemeYlOrRd[1,5]);
// var color = d3.scaleOrdinal(d3.interpolateYlGn(0.5));
// console.log(color,test)

// const colors = [
//   '#0b2b00',
//   '#2b4f02',
//   '#55750a',
//   '#bdc41f',
//   '#869d14'
// ];

let width = window.innerWidth;
let height = window.innerHeight - 50;

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

d3.csv('seagrass-links.csv').then(async linksCSV => {
  for(let l of linksCSV) {
    let temp = l.source;
    l.source = l.target;
    l.target = temp;
  }

  let trophicLevels = await d3.csv('trophic-levels.csv');
  let minTrophicLevel = d3.min(trophicLevels, d => +d['trophic-level']);
  let maxTrophicLevel = d3.max(trophicLevels, d => +d['trophic-level']);

  let padding = 10;

  let x = d3.scaleLinear()
    .domain([minTrophicLevel, maxTrophicLevel])
    .range([padding, width - padding]);

  let types = Array.from(new Set(linksCSV.map(d => d.type)));

  let data = ({ nodes: Array.from(new Set(linksCSV.flatMap(l => [l.source, l.target])), id => ({ id })), links: linksCSV });

  const links = data.links.map(d => Object.create(d));
  const nodes = data.nodes.map((d, i) => {
    let d2 = trophicLevels.find(tl => tl.name === d.id);
    let trophicLevel = +d2['trophic-level'];

    let result = { ...d };
    // result.x = x(trophicLevel) - (width / 2);
    // result.y = (i * 10) - (height / 4);
    result.x = +d2.x * width;
    result.y = +d2.y * height;
    // result.desc = d2.desc;
    result.trophicLevel = trophicLevel;
    result.diet = linksCSV.filter(l => result.id === l.source);

    return result;
  });

  window.links = links;
  window.nodes = nodes;

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).strength(0))

  let tooltip = d3.select(".tooltip");

  const svg = d3.select('#viz').append('svg')
    .attr('viewBox', [-width / 2, -height / 2, width, height])
    .style('font', '12px sans-serif')
    .on('click', () => {
      svg.selectAll('.animated-link').remove();
      svg.node().classList.remove('node-selected');
      tooltip.style("opacity", 0);
    });

  svg.append('line')
    .attr('class', 'line1')
    .attr('x1', -0.2734375 * width)
    .attr('x2', -0.2734375 * width)
    .attr('y1', -0.2161383285 * height)
    .attr('y2', 0.4610951009 * height + 30)
    .attr('stroke', '#666')
    .attr('stroke-dasharray', 2);

  svg.append('line')
    .attr('class', 'line2')
    .attr('x1', 0.035 * width)
    .attr('x2', 0.035 * width)
    .attr('y1', -0.4422766571 * height)
    .attr('y2', 0.4610951009 * height + 30)
    .attr('stroke', '#666')
    .attr('stroke-dasharray', 2);

  svg.append('line')
    .attr('class', 'line3')
    .attr('x1', 0.34375 * width)
    .attr('x2', 0.34375 * width)
    .attr('y1', -0.4422766571 * height)
    .attr('y2', 0.4610951009 * height + 30)
    .attr('stroke', '#666')
    .attr('stroke-dasharray', 2);


  svg.append('text')
    .text('Trophic 1')
    .attr('x', -0.39375 * width)
    .attr('y', 0.4610951009 * height + 20)
    .style('font-weight', 'bold');

  svg.append('text')
    .text('Trophic 2')
    .attr('x', -0.13375 * width)
    .attr('y', 0.4610951009 * height + 20)
    .style('font-weight', 'bold');


  svg.append('text')
    .text('Trophic 3')
    .attr('x', 0.18375 * width)
    .attr('y', 0.4610951009 * height + 20)
    .style('font-weight', 'bold');

  svg.append('text')
    .text('Trophic 4')
    .attr('x', 0.41375 * width)
    .attr('y', 0.4610951009 * height + 20)
    .style('font-weight', 'bold');
  
  svg.append('foreignObject')
    .attr('x', -780)
    .attr('y', -240)
    .attr("width", 170)
    .attr("height", 90)
    .append('xhtml:div')
    .html(`<p class="callout">Trophic Level 1 are
      energy producers. 
      Removing them from the ecosystem removes them as a food source for other consumers. 
      Removing those consumers has a chain reaction affect. 
      Click on a node to see the web.</p>`);

  svg.append('foreignObject')
    .attr('x', -200)
    .attr('y', 340)
    .attr("width", 170)
    .attr("height", 90)
    .append('xhtml:div')
    .html(`<p class="callout">Most components in this ecosystem are 
      trophic level 2 and serve as food sources for larger predators. 
      Some are even caniballistic.</p>`);
  
  svg.append('foreignObject')
    .attr('x', 620)
    .attr('y', -240)
    .attr("width", 170)
    .attr("height", 90)
    .append('xhtml:div')
    .html(`<p class="callout">Though some animals have no 
      predators in this local ecosystem, they may be energy 
      source for other predators outside the area, as well as 
      being returned to the soil to be consumed by decomposers.</p>`);


  // Per-type markers, as they don't inherit styles.
  svg.append('defs').selectAll('marker')
    .data(types)
    .join('marker')
    .attr('id', d => `arrow-${d}`)
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 15)
    .attr('refY', -0.5)
    .attr('markerWidth', 8)
    .attr('markerHeight', 8)
    .attr('orient', 'auto')
    .append('path')
    .attr('fill', 'orange')
    .attr('d', 'M0,-5L10,0L0,5');

  const linkGroup = svg.append('g')
    .attr('fill', 'none')
    .attr('stroke-width', 1);

  const link = linkGroup
    .selectAll('path')
    .data(links)
    .join('path')
    .attr('class', 'link')
    .attr('stroke', '#ddd')
    .attr('marker-end', d => `url(${new URL(`#arrow-${d.type}`, location)})`);

  const node = svg.append('g')
    .attr('fill', 'currentColor')
    .attr('stroke-linecap', 'round')
    .attr('stroke-linejoin', 'round')
    .selectAll('g')
    .data(nodes)
    .join('g')
    .on('click', function (d) {
      svg.node().classList.add('node-selected');
      svg.selectAll('.animated-link').remove();

      animateLinks(d.id);

      d3.event.stopPropagation();
    })
    .on('mouseover', function (d) {

      let bulletList = '';
      let dietSum = 0;

      for (k = 0; k < d.diet.length; k++) {
        bulletList += `<li>${d.diet[k].target} (<span>${d.diet[k].amount}%</span> of diet)</li>`
        dietSum += +d.diet[k].amount;
      }

      let str = ((dietSum > 0) ? `<span class="name">${d.id}</span> 
                (trophic ${d.trophicLevel}) are direct food source for: 
                <ul>${bulletList}</ul>Click to animate foodweb impact.` :
                `<span class="name">${d.id}</span> (trophic ${d.trophicLevel}) 
                have no predators in this ecosystem.`);
      
      tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);

      tooltip.html(str)
        .style("top", (d3.event.pageY + 10) + "px");
      
      if (d.trophicLevel < 3.8) {
        tooltip.style("left", (d3.event.pageX) + "px")
      } else {
        tooltip.style("left", ((d3.event.pageX) - 120) + "px")
      }

    })
    .on('mouseout', function (d) {
      tooltip.style("opacity", 0);
    })
    .call(drag(simulation));

  function animateLinks(startId) {
    let open = [startId];

    let visited = {};

    let i = 0;

    while (open.length) {
      let nextOpen = [];

      while (open.length) {
        let id = open.shift();
        visited[id] = true;

        let edges = links.filter(l => l.source.id === id);

        for (let edge of edges) {
          linkGroup
            .append('path')
            .attr('class', `animated-link animated-link-${i}`)
            // .attr('stroke', '#ff00ff')
            .attr('stroke', color(i))
            .attr('d', linkArc(edge));

          if (!visited[edge.target.id]) {
            nextOpen.push(edge.target.id);
          }
        }
      }

      open = nextOpen;

      anime({
        targets: `.animated-link-${i}`,
        strokeDashoffset: [anime.setDashoffset, 0],
        easing: 'easeInOutSine',
        duration: 1500,
        delay: 1500 * i
      });

      i++;
    }
  }

  node.append('circle')
    .attr('stroke', 'white')
    .attr('stroke-width', 1.5)
    .attr('r', 4);

  node.append('text')
    .attr('x', 8)
    .attr('y', '0.31em')
    .text(d => d.id)
    .clone(true).lower()
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-width', 3);

  simulation.on('tick', () => {
    link.attr('d', linkArc);
    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });
})

function createTrophicLevelsString() {
  let str = `name,trophic-level,x,y\n`;

  for (let n of nodes) {
    str += `${n.id},${n.trophicLevel},${n.x / width},${n.y / height}\n`;
  }

  console.log(str)
}