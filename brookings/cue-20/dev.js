/* TODO
5. 2022 doesn't expand
7. mobile view
9. In the desktop view, when a timeline item is in view I do not show the year above the title as it’s highlighted in the left bar. I’m fine with keeping it as you have now, but it should be consistent across all items. x
*/


const BASE_URL = (location.hostname === "localhost" || location.hostname === "127.0.0.1") ? "./" : "http://aa61a0da3a709a1480b1-9c0895f07c3474f6636f95b6bf3db172.r70.cf1.rackcdn.com/interactives/2022/cue-20-years-slideshow/";

let tooltips = {
	"shape": "Shape the global agenda to prioritize and improve learning.",
	"advance": "Advance policy and practice for inclusive and equitable education that enables young people to develop a breadth of skills to thrive.",
	"support": "Support local leaders to advance change.",
	"incubate": "Incubate global education organizations and tools.",
	"catalyze": "Catalyze education systems transformation through diverse networks."
}

jQuery('.tags span').each((i, elem) => {
	elem.dataset.tippyContent = tooltips[elem.dataset.tag];
})

tippy('.tags span', {
	placement: 'bottom',
	theme: 'tomato',
});

const sliderHeight = 500;
const sliderPadding = 25;
const innerSliderHeight = sliderHeight - sliderPadding - sliderPadding;
const deltaY = innerSliderHeight / jQuery('.timeline-work').length;

jQuery('.timeline-work').each((i, elem) => {
	let top = sliderPadding + (i * deltaY);
	let year = elem.dataset.year || '	&nbsp;&nbsp;&nbsp;&nbsp;';
	jQuery('#date-slider-content').append(`<div class="menu-item" style="top: ${top}px;" data-index="${i}"><div class="circle"></div><span>${year}</span></div>`);
});

jQuery('#date-slider-content').append(`<div class="next"><span class="muted">BOTTOM</span><img src="${BASE_URL}/assets/arrow-down-icon.svg"></div>`);

jQuery('#date-slider .prev').click(() => {
	selectAndScrollToTimelineItem(0);
});

jQuery('#date-slider .next').click(function () {
	selectAndScrollToTimelineItem(jQuery('.timeline-work').length - 1);
});

jQuery('#date-slider .menu-item').click(function () {
	selectAndScrollToTimelineItem(this.dataset.index);
});

function selectAndScrollToTimelineItem(i) {
	selectTimelineItem(i);

	if(window.innerWidth >= 1024) {
		jQuery('.timeline-work .article').get(i).scrollIntoView();
		window.scrollBy(0, -20);
	} else {
		jQuery('.timeline-work').get(i).scrollIntoView();
	}
}

let currentIndex = 0;

function selectTimelineItem(i) {
	currentIndex = +i;

	jQuery('#date-slider .menu-item.selected').removeClass('selected');
	jQuery('#date-slider .menu-item').get(i).classList.add('selected');

	jQuery('.timeline-work').each((j, elem) => {
		if (j <= i) {
			elem.classList.remove('minimal');
		} else {
			elem.classList.add('minimal');
		}
	});
}

selectTimelineItem(0);

jQuery(window).scroll(autoExpandTimeline);

function autoExpandTimeline() {
	let showIndex = 0;

	jQuery('.timeline-work').each((i, elem) => {
		if (window.scrollY >= (elem.offsetTop - 350)) {
			showIndex = i;
		}
	});

	selectTimelineItem(showIndex);
}