'use strict';

( function () {
	/* touch detection */
	window.addEventListener( 'touchstart', function touched() {
		document.body.parentElement.classList.add( 'touch' );
		window.removeEventListener( 'touchstart', touched, false );
	}, false );

	/* lazy loading and button controls */
	let gallery = document.querySelector( '.portfolio__container' );
	let slides = gallery.querySelectorAll( '.portfolio__item' );

	slides.forEach( ( slide ) => {
		const slideLink = slide.querySelector( '.portfolio__link' );
		slideLink.setAttribute( 'tabindex', '-1' );
	} );

	let observerSettings = {
		root: gallery,
	};

	if ( 'IntersectionObserver' in window ) {
		let scrollIt = function scrollIt( slideToShow ) {
			const currentIndex = Array.prototype.indexOf.call( slides, slideToShow );
			const gapsWidth = ( slides.length - 1 ) * 32;
			const slideWidth = ( gallery.scrollWidth - gapsWidth ) / slides.length;
			const gapsBeforeCurrentSlide = currentIndex * 32;
			let scrollPos = currentIndex * slideWidth + gapsBeforeCurrentSlide;
			gallery.scrollTo( {
				left: scrollPos,
				behavior: 'smooth',
			} );
		};

		let showSlide = function showSlide( dir, slides ) {
			let visible = document.querySelectorAll( '.portfolio__container .visible' );
			let i = dir === 'previous' ? 0 : 1;

			if ( visible.length > 1 ) {
				scrollIt( visible[i] );
			} else {
				let newSlide = i === 0 ? visible[0].previousElementSibling : visible[0].nextElementSibling;
				if ( newSlide ) {
					scrollIt( newSlide );
				}
			}
		};

		let callback = function callback( slides, observer ) {
			Array.prototype.forEach.call( slides, function ( entry ) {
				entry.target.classList.remove( 'visible' );
				let link = entry.target.querySelector( 'a' );
				link.setAttribute( 'tabindex', '-1' );
				if ( !entry.intersectionRatio > 0 ) {
					return;
				}
				let img = entry.target.parentNode.querySelector( 'img' );
				if ( img.dataset.src ) {
					img.setAttribute( 'src', img.dataset.src );
					img.removeAttribute( 'data-src' );
				}
				entry.target.classList.add( 'visible' );
				link.removeAttribute( 'tabindex', '-1' );
			} );
		};

		let observer = new IntersectionObserver( callback, observerSettings );
		Array.prototype.forEach.call( slides, function ( t ) {
			return observer.observe( t );
		} );

		let controls = document.querySelector( '.portfolio__nav' );
		controls.removeAttribute( 'hidden' );

		controls.addEventListener( 'click', function ( e ) {
			const direction = e.target.classList.contains( 'ico-button_previous' ) ? 'previous' : 'next';
			showSlide( direction, slides );
		} );
	} else {
		Array.prototype.forEach.call( slides, function ( s ) {
			let img = s.querySelector( 'img' );
			img.setAttribute( 'src', img.getAttribute( 'data-src' ) );
		} );
	}
} )();
