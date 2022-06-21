const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = Math.PI / 180;

const colors = {
  '2010': '#ccc',
  '2011': '#ccc',
  '2012': '#ccc',
  '2013': '#ccc',
  '2014': '#ccc',
  '2015': '#ccc',
  '2016': '#ccc',
  '2017': '#ccc',
  '2018': '#ccc',
  '2019': '#ccc'
};

const svgContainer = d3.select('#svg-container');

/* ********* HERE ********* */
const totalAngle = (2 * Math.PI) * .95;
const totalAngleDeg = totalAngle * RAD_TO_DEG;

let imageSize;
let currentIndex = 0;
let dataByYear;
let data;

d3.json('data.json').then(result => {
  for (let year in result) {
    let arr = result[year];

    arr.sort((a, b) => {
      let date1 = moment(a.date, 'MM/DD/YYYY');
      let date2 = moment(b.date, 'MM/DD/YYYY');
      return date1.diff(date2);
    });
  }

  dataByYear = result;

  $('.hide-to-start').removeClass('hide-to-start');
  createChart();
  getTopEvents();
});

function createChart() {
  svgContainer.select('svg').remove();

  let width = parseInt(svgContainer.style('width'));
  let height = parseInt(svgContainer.style('height')) - 50;

  let svg = d3.select('#svg-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  let centered = svg.append('g')
    .attr('transform', `translate(${(width / 2)}, ${(height / 2) + 10})`);

  /* ********* HERE ********* */
  let outerRadius = (Math.min(width, height) / 2) * 0.97;
  let innerRadius = 0.7 * outerRadius;
  let maxRadius = outerRadius - innerRadius;

  data = [];
  let labelData = {};

  for (let year in dataByYear) {
    let yearData = dataByYear[year];

    for (let d of yearData) {
      d.year = year;
      data.push(d);
    }

    labelData[year] = {
      startAngle: Infinity,
      endAngle: -Infinity
    };
  }

  /* ********* HERE ********* */
  let count = data.length;
  let startAngle = 90 - 53;
  let rectAngle = (totalAngle / count) * RAD_TO_DEG;
  let minPercent2 = .8;
  let innerCircumference = totalAngle * innerRadius * minPercent2;
  let rectWidth = (innerCircumference / count) * 0.5;

  let currentYear = data[0].year;
  let currentYearIndex = 0;

  for (let i = 0; i < count; i++) {
    let d = data[i];

    if (d.year !== currentYear) {
      currentYear = d.year;
      currentYearIndex = i;
    }

    /* ********* HERE ********* */
    let p = ((+d.year) - 2009) / 10;
    let minPercent = 0.6;
    let radius = maxRadius * (minPercent + ((1 - minPercent) * p));

    d.radius = radius;
    d.innerRadius = innerRadius;
    d.angle = startAngle + (rectAngle * i);
    d.rectWidth = rectWidth;

    let ld = labelData[d.year];

    if (d.angle < ld.startAngle) {
      ld.startAngle = d.angle;
      ld.radius = innerRadius + radius;
    }

    if (d.angle > ld.endAngle) {
      ld.endAngle = d.angle;
      ld.radius = innerRadius + radius;
    }
  }

  imageSize = innerRadius * 0.95;

  createBars(centered, data);
  createLabels(centered, labelData);
  moveEventDescription(width, height, data);
  moveAbsoluteLeftTop(width, height, '#callout-2016', -0.37, 0.3);
  moveAbsoluteLeftBottom(width, height, '#callout-2018', -0.38, 0.3);
  moveAbsoluteRightTop(width, height, '#callout-2011', -0.4, -0.1);
  moveAbsoluteLeftTop(width, height, '#callout-2014', 0.00, 0.47);
  moveAbsoluteLeftTop(width, height, '#callout-2015', -0.18, 0.455);

  setActiveBar(data[currentIndex], currentIndex);
}

function createBars(parent, data) {
  parent.selectAll('.bar')
    .data(data)
    .enter()
    .append('line')
    .attr('class', (d, i) => {
      let categories = d.category.split(',').map(c => c.replace(' ', ''));
      return `bar bar${i} ${categories.join(' ')}`;
    })
    .attr('x1', d => Math.cos((d.angle - 90) * DEG_TO_RAD) * d.innerRadius)
    .attr('y1', d => Math.sin((d.angle - 90) * DEG_TO_RAD) * d.innerRadius)
    .attr('x2', d => Math.cos((d.angle - 90) * DEG_TO_RAD) * (d.innerRadius + d.radius))
    .attr('y2', d => Math.sin((d.angle - 90) * DEG_TO_RAD) * (d.innerRadius + d.radius))
    .attr('stroke-width', d => d.rectWidth)
    .attr('stroke', d => colors[d.year])
    .on('mouseover', setActiveBar);

  for (let i = 0; i < data.length; i++) {
    let d = data[i];
    createCircleImage(parent, d, i);
  }
}

function createCircleImage(parent, d, i) {
  let eventImageCircle = parent.append('clipPath')
    .attr('id', `eventImage${i}`)
    .append('circle')
    .attr('r', imageSize / 2);

  let eventImage = parent.append('image')
    .style('display', 'none')
    .attr('id', `bar-image${i}`)
    .attr('class', 'bar-image')
    .attr('clip-path', `url(#eventImage${i})`);

  if (d.image) {
    let src = `images/${d.year}/${d.image}`;

    let img = new Image();

    img.onload = function () {
      eventImage.attr('href', src);

      let halfSize = imageSize / 2;
      let xOffset = imageSize * 0.0;
      let yOffset = imageSize * 0.0;

      if (this.width >= this.height) {
        let halfWidth = this.width * (halfSize / this.height);

        eventImage
          .attr('width', halfWidth * 2)
          .attr('height', imageSize)
          .style('transform', `translate(-${halfWidth - xOffset}px,-${halfSize - yOffset}px)`);

        eventImageCircle
          .attr('cx', halfWidth)
          .attr('cy', halfSize);

      } else {
        let halfHeight = this.height * (halfSize / this.width);

        eventImage
          .attr('width', imageSize)
          .attr('height', halfHeight * 2)
          .style('transform', `translate(-${halfSize - xOffset}px,-${halfHeight - yOffset}px)`);

        eventImageCircle
          .attr('cx', halfSize)
          .attr('cy', halfHeight);
      }
    }

    img.src = src;
  } else {
    eventImage
      .attr('width', 0)
      .attr('height', 0);
  }
}

function setActiveBar(d, i) {
  let date = moment(d.date, 'MM/DD/YYYY').format('MMMM D, YYYY');
  d3.select('#event-desc-top .date').text(date);
  d3.select('#event-desc-top .name').text(d.event);
  $('#event-desc-bottom .desc').html(`${d.description} 
    <nobr><a href="${ d.link}" target="_blank">[more]</a> <a href="${d.src}" target="_blank">[img]</a></nobr>`);
  let isActive = d.event in localStorage;
  d3.select('#event-desc-bottom .remember').node().classList.toggle('active', isActive);

  let imgName = isActive ? 'star-filled' : 'star-unfilled';
  d3.select('#event-desc-bottom .remember img').attr('src', `images/assets/SVG/${imgName}.svg`);

  $('.bar-image').hide();
  $(`#bar-image${i}`).show();

  d3.select(`.bar${currentIndex}`).node().classList.remove('active');
  currentIndex = i;
  d3.select(`.bar${currentIndex}`).node().classList.add('active');
}

function createLabels(parent, labelData) {
  let arc = d3.arc();

  for (let year in labelData) {
    let ld = labelData[year];

    let pathData = arc({
      innerRadius: ld.radius + 9,
      outerRadius: ld.radius + 10,
      startAngle: ld.startAngle * DEG_TO_RAD,
      endAngle: ld.endAngle * DEG_TO_RAD
    });

    parent.append('path')
      .attr('d', pathData)
      .style('fill', '#999');

    let textRadius = ld.radius + 5.5;
    let angle = (ld.startAngle + ld.endAngle) / 2;
    angle -= 90;
    angle *= DEG_TO_RAD;
    let x = Math.cos(angle) * textRadius;
    let y = Math.sin(angle) * textRadius;
    let rotate = (angle * (180 / Math.PI)) + 90;

    let textGroup = parent.append('g')
      .attr('transform', `translate(${x},${y})rotate(${rotate})`)

    let text = textGroup.append('text')
      .text(year)
      .attr('text-anchor', 'middle')

    let bounds = text.node().getBBox();

    const padding = 2;

    textGroup.insert('rect', ':first-child')
      .attr('x', bounds.x - padding)
      .attr('y', bounds.y)
      .attr('width', bounds.width + padding + padding)
      .attr('height', bounds.height)
      .attr('fill', '#fff');
  }
}

function moveAbsoluteLeftTop(width, height, selector, leftOffset, topOffset) {
  let left = (0.5 + leftOffset) * width;
  let top = (0.5 + topOffset) * height;

  d3.select(selector)
    .style('left', `${left}px`)
    .style('top', `${top}px`)
}

function moveAbsoluteLeftBottom(width, height, selector, leftOffset, bottomOffset) {
  let left = (0.5 + leftOffset) * width;
  let bottom = (0.5 + bottomOffset) * height;

  d3.select(selector)
    .style('left', `${left}px`)
    .style('bottom', `${bottom}px`)
}

function moveAbsoluteRightTop(width, height, selector, rightOffset, topOffset) {
  let right = (0.5 + rightOffset) * width;
  let top = (0.5 + topOffset) * height;

  d3.select(selector)
    .style('right', `${right}px`)
    .style('top', `${top}px`)
}

function moveEventDescription(width, height, data) {
  let top = (height / 2) - (data[0].innerRadius * 0.80);
  let bottom = (height / 2) - (data[0].innerRadius * 0.73);
  let descWidth = data[0].innerRadius * 1.25;
  let right = (width / 2) - descWidth / 2;

  d3.select('#event-desc-top')
    .style('top', `${top}px`)
    .style('right', `${right}px`)
    .style('width', `${descWidth}px`);

  d3.select('#event-desc-bottom')
    .style('bottom', `${bottom}px`)
    .style('right', `${right}px`)
    .style('width', `${descWidth}px`);

  let fontSize = parseFloat($('.prev').css('font-size'));

  d3.select('.prev')
    .style('top', `${(height / 2) - (fontSize * 0.4)}px`)
    .style('right', `${(width / 2) + (data[0].innerRadius * 0.6) - (fontSize * 0.1)}px`)
    .style('font-size', `${fontSize}px`)

  d3.select('.next')
    .style('top', `${(height / 2) - (fontSize * 0.4)}px`)
    .style('left', `${(width / 2) + (data[0].innerRadius * 0.6)}px`)
    .style('font-size', `${fontSize}px`)
}

function prev() {
  if ($('svg').hasClass('filters-active')) {
    let bars = $('.bar').toArray();

    for (let i = 1; i < bars.length; i++) {
      let index = (currentIndex - i);

      if (index < 0) {
        index += data.length;
      }

      if ($(bars[index]).hasClass('filter-active')) {
        setActiveBar(data[index], index);
        break;
      }
    }
  } else {
    let i = currentIndex - 1;

    if (i < 0) {
      i += data.length;
    }

    setActiveBar(data[i], i);
  }
}

function next() {
  if ($('svg').hasClass('filters-active')) {
    let bars = $('.bar').toArray();

    for (let i = 1; i < bars.length; i++) {
      let index = (currentIndex + i) % data.length;

      if ($(bars[index]).hasClass('filter-active')) {
        setActiveBar(data[index], index);
        break;
      }
    }
  } else {
    let i = (currentIndex + 1) % data.length;
    setActiveBar(data[i], i);
  }
}

document.querySelector('.prev').addEventListener('click', prev);
document.querySelector('.next').addEventListener('click', next);

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    prev();
  } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    next();
  }
});

window.addEventListener('resize', debounce(createChart, 200));

function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this, args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

let gamepadIndex = -1;

window.addEventListener('gamepadconnected', function (e) {
  gamepadIndex = e.gamepad.index;
  gameLoop();
});

function gameLoop() {
  let gamepad = navigator.getGamepads()[gamepadIndex];

  if (gamepad) {
    if (Math.hypot(gamepad.axes[0], gamepad.axes[1]) > 0.1) {
      setActiveBarXY(gamepad.axes[0], gamepad.axes[1]);
    } else if (Math.hypot(gamepad.axes[2], gamepad.axes[3]) > 0.1) {
      setActiveBarXY(gamepad.axes[2], gamepad.axes[3]);
    }
  }

  requestAnimationFrame(gameLoop);
}

function setActiveBarXY(x, y) {
  let angle = (Math.atan2(y, x) * RAD_TO_DEG) + 90;

  if (angle < 0) {
    angle += 360;
  }

  if (angle > totalAngleDeg) {
    let halfway = (totalAngleDeg + 360) / 2;
    angle = (angle > halfway) ? 0 : totalAngleDeg - 1;
  }

  let i = Math.floor((angle / totalAngleDeg) * data.length);

  if (currentIndex !== i) {
    setActiveBar(data[i], i);
  }
}

document.querySelector('#event-desc-bottom .remember').addEventListener('click', function (e) {
  let { event } = data[currentIndex];
  let isActive = event in localStorage;

  isActive = !isActive;

  if (isActive) {
    localStorage.setItem(event, 'yes');
  } else {
    localStorage.removeItem(event);
  }

  this.classList.toggle('active', isActive);

  fetch('https://tiffanyfrance.com/decade-in-review/api/event-remember.php', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      event,
      'remember': isActive ? 1 : -1
    })
  });

  e.preventDefault();
});

function getTopEvents() {
  fetch('https://tiffanyfrance.com/decade-in-review/api/top-events.php')
    .then(response => response.json())
    .then(events => {
      let $topEvents = $('.top-events');

      events = events.splice(0, 12);

      for (let i = 0; i < events.length; i++) {
        let { event } = events[i];

        let d = data.find(d => d.event === event);

        $topEvents.append(`
        <div class="grid-col">
          <p class="center">
            <img src="images/${d.year}/${d.image}" style="max-width:150px;" /><br />
            <span>#${i + 1} <a href="${d.link}" target="_blank">${event}</a></span>
          </p>
        </div>
      `);
      }
    });
}

$('#event-desc-bottom .remember a').mouseover(() => {
  d3.select('#event-desc-bottom .remember img').attr('src', `images/assets/SVG/star-filled.svg`);
});

$('#event-desc-bottom .remember a').mouseout(() => {
  let { event } = data[currentIndex];
  let isActive = event in localStorage;
  let imgName = isActive ? 'star-filled' : 'star-unfilled';
  d3.select('#event-desc-bottom .remember img').attr('src', `images/assets/SVG/${imgName}.svg`);
});

$('#filters button').click(function () {
  $(this).toggleClass('active');

  $('.bar.filter-active').removeClass('filter-active');

  let areFiltersActive = false;

  $('#filters button.active').each((i, elem) => {
    let category = $(elem).attr('category');
    $(`.bar.${category}`).addClass('filter-active');
    areFiltersActive = true;
  });

  $('svg').toggleClass('filters-active', areFiltersActive);

  if (areFiltersActive) {
    let bars = $('.bar').toArray();

    if (!$(bars[currentIndex]).hasClass('filter-active')) {
      for (let i = 0; i < bars.length; i++) {
        if ($(bars[i]).hasClass('filter-active')) {
          setActiveBar(data[i], i);
          break;
        }
      }
    }
  }
});

$('#filters h3').on('click', function () {
  $(this).parent().find('button').toggle();
});