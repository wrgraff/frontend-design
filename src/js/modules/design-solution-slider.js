export const initDesignSolutionSlider = () => {
	const sliders = document.querySelectorAll( '[data-slider]' );
	const listeners = [];

	if ( !sliders.length ) {
		return () => {};
	}

	sliders.forEach( ( slider ) => {
		const slides = Array.from( slider.querySelectorAll( '[data-slider-slide]' ) );

		if ( slides.length < 2 ) {
			return;
		}

		const prevButton = slider.querySelector( '[data-slider-control-prev]' );
		const nextButton = slider.querySelector( '[data-slider-control-next]' );
		const counterElement = slider.querySelector( '[data-slider-counter]' );
		const descriptionElement = slider.querySelector( '[data-slider-description]' );
		const statusElement = slider.querySelector( '[data-slider-status]' );
		let activeIndex = slides.findIndex( ( slide ) => !slide.hidden );

		if ( activeIndex < 0 ) {
			activeIndex = 0;
		}

		const getSlideDescription = ( index ) => {
			const slide = slides[index];

			if ( !slide || !slide.dataset || typeof slide.dataset.sliderSlideDescription !== 'string' ) {
				return '';
			}

			return slide.dataset.sliderSlideDescription.trim();
		};

		const getCounterText = ( index ) => {
			return `${ index + 1 } / ${ slides.length } slides`;
		};

		const showSlide = ( nextIndex ) => {
			const boundedIndex = Math.max( 0, Math.min( nextIndex, slides.length - 1 ) );
			activeIndex = boundedIndex;
			const activeElement = document.activeElement;

			slides.forEach( ( slide, slideIndex ) => {
				const isActive = slideIndex === activeIndex;
				slide.hidden = !isActive;
				slide.setAttribute( 'aria-hidden', isActive ? 'false' : 'true' );
			} );

			if ( prevButton ) {
				prevButton.disabled = activeIndex === 0;
			}

			if ( nextButton ) {
				nextButton.disabled = activeIndex === slides.length - 1;
			}

			if ( activeElement === prevButton && prevButton && prevButton.disabled ) {
				if ( nextButton && !nextButton.disabled ) {
					nextButton.focus();
				}
			}

			if ( activeElement === nextButton && nextButton && nextButton.disabled ) {
				if ( prevButton && !prevButton.disabled ) {
					prevButton.focus();
				}
			}

			const description = getSlideDescription( activeIndex );
			const counterText = getCounterText( activeIndex );

			if ( counterElement ) {
				counterElement.textContent = counterText;
			}

			if ( descriptionElement ) {
				descriptionElement.textContent = description;
			}

			if ( statusElement ) {
				statusElement.textContent = description
					? `${ counterText }. ${ description }`
					: counterText;
			}
		};

		showSlide( activeIndex );

		if ( slider.tabIndex < 0 ) {
			slider.tabIndex = 0;
		}

		if ( prevButton ) {
			const previousClickHandler = () => {
				showSlide( activeIndex - 1 );
			};
			prevButton.addEventListener( 'click', previousClickHandler );
			listeners.push( () => prevButton.removeEventListener( 'click', previousClickHandler ) );
		}

		if ( nextButton ) {
			const nextClickHandler = () => {
				showSlide( activeIndex + 1 );
			};
			nextButton.addEventListener( 'click', nextClickHandler );
			listeners.push( () => nextButton.removeEventListener( 'click', nextClickHandler ) );
		}

		const keydownHandler = ( event ) => {
			if ( event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ) {
				return;
			}

			if ( event.key === 'ArrowLeft' ) {
				showSlide( activeIndex - 1 );
				event.preventDefault();
				return;
			}

			if ( event.key === 'ArrowRight' ) {
				showSlide( activeIndex + 1 );
				event.preventDefault();
				return;
			}

			if ( event.key === 'Home' ) {
				showSlide( 0 );
				event.preventDefault();
				return;
			}

			if ( event.key === 'End' ) {
				showSlide( slides.length - 1 );
				event.preventDefault();
			}
		};

		slider.addEventListener( 'keydown', keydownHandler );
		listeners.push( () => slider.removeEventListener( 'keydown', keydownHandler ) );
	} );

	return () => {
		listeners.forEach( ( removeListener ) => removeListener() );
	};
};
