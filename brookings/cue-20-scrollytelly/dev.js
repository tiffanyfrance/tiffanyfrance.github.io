const BASE_URL = (location.hostname === "localhost" || location.hostname === "127.0.0.1") ? "./" : "http://aa61a0da3a709a1480b1-9c0895f07c3474f6636f95b6bf3db172.r70.cf1.rackcdn.com/interactives/2022/cue-20-years-slideshow/";

let tooltips = {
	"shape": "Shape the global agenda to prioritize and improve learning.",
	"advance": "Advance policy and practice for inclusive and equitable education that enables young people to develop a breadth of skills to thrive.",
	"support": "Support local leaders to advance change.",
	"incubate": "Incubate global education organizations and tools.",
	"catalyze": "Catalyze education systems transformation through diverse networks."
}

const sliderHeight = 500;
const sliderPadding = 25;
const innerSliderHeight = sliderHeight - sliderPadding - sliderPadding;
const numItems = jQuery('.timeline-work').length;
const deltaY = innerSliderHeight / numItems;

jQuery('.timeline-work').each((i, elem) => {
	let top = sliderPadding + (i * deltaY);
	let year = elem.dataset.year || '	&nbsp;&nbsp;&nbsp;&nbsp;';
	jQuery('#date-slider-content').append(`<div class="menu-item" style="top: ${top}px;" data-index="${i}"><div class="circle"></div>${year}</div>`);
});

jQuery('#date-slider-content').append(`<div class="next"><img src="${BASE_URL}/assets/arrow-down-icon.svg"></div>`);

jQuery('#date-slider .prev').click(() => {
	let i = jQuery('#date-slider .menu-item.selected').data('index') - 1;

	if (i >= 0) {
		selectTimelineItem(i);
	}
});

jQuery('#date-slider .next').click(function () {
	let i = jQuery('#date-slider .menu-item.selected').data('index') + 1;

	if (i < numItems) {
		selectTimelineItem(i);
	}
});

jQuery('#date-slider .menu-item').click(function () {
	selectTimelineItem(this.dataset.index);
	let pos = (this.dataset.index * scrollHeight / numItems) + jQuery('#timeline-wrapper').offset().top + 100;
	window.scrollTo(0, pos);
});

let currentIndex = 0;

function selectTimelineItem(i) {
	currentIndex = +i;

	jQuery('#date-slider .menu-item.selected').removeClass('selected');
	jQuery('#date-slider .menu-item').get(i).classList.add('selected');

	jQuery('.timeline-work').each((j, elem) => {
		if (j != i) {
			elem.classList.add('hide');
		} else {
			elem.classList.remove('hide');
		}

		// if (j != i) {
		// 	elem.classList.add('minimal');
		// } else {
		// 	elem.classList.remove('minimal');
		// }
	});
}

selectTimelineItem(0);

const stepHeight = 75;
const scrollHeight = (window.innerHeight * (numItems) * (stepHeight / 100)) - window.innerHeight;

jQuery(window).scroll(() => {
	let scrollPos = window.scrollY - jQuery('#timeline-wrapper').offset().top;
	let showIndex = Math.floor((scrollPos / scrollHeight) * numItems);

	if (showIndex >= 0 && showIndex < numItems && showIndex != currentIndex) {
		selectTimelineItem(showIndex);
	}
});

jQuery('#timeline-wrapper').css('height', `${numItems * stepHeight}vh`);