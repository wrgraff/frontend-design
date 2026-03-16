'use strict';

( () => {
	const sliders = document.querySelectorAll( '.design-solution[data-design-solution-slider]' );

	if ( !sliders.length ) {
		return;
	}

	sliders.forEach( ( slider ) => {
		const slides = Array.from( slider.querySelectorAll( '.design-solution__slide' ) );

		if ( slides.length < 2 ) {
			return;
		}

		const prevButton = slider.querySelector( '.design-solution__control_direction_previous' );
		const nextButton = slider.querySelector( '.design-solution__control_direction_next' );
		let activeIndex = slides.findIndex( ( slide ) => !slide.hidden );

		if ( activeIndex < 0 ) {
			activeIndex = 0;
		}

		const showSlide = ( nextIndex ) => {
			activeIndex = ( nextIndex + slides.length ) % slides.length;

			slides.forEach( ( slide, slideIndex ) => {
				const isActive = slideIndex === activeIndex;
				slide.hidden = !isActive;
				slide.classList.toggle( 'design-solution__slide_active', isActive );
			} );
		};

		showSlide( activeIndex );

		if ( prevButton ) {
			prevButton.addEventListener( 'click', () => {
				showSlide( activeIndex - 1 );
			} );
		}

		if ( nextButton ) {
			nextButton.addEventListener( 'click', () => {
				showSlide( activeIndex + 1 );
			} );
		}
	} );
} )();
