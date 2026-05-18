const ACTIVE_ATTRIBUTE = 'data-section-theme-active';
const PAGE_THEME_ACTIVE_ATTRIBUTE = 'data-page-theme-active';
const PAGE_THEME_ATTRIBUTE = 'data-page-theme';
const PAGE_THEME_TRANSITION_CLASS = 'page_transition_theme';
const SECTION_THEME_TRANSITION_CLASS = 'section_transition_theme';
const BASE_THEME = 'base';
const THEMED_SECTION_SELECTOR = '[data-section-theme]';
const THEME_ATTRIBUTE = 'data-section-theme';
const HERO_SELECTOR = '[data-case-hero]';

export const initSectionThemeScroll = () => {
	const themedSections = Array.from( document.querySelectorAll( THEMED_SECTION_SELECTOR ) );
	const hero = document.querySelector( HERO_SELECTOR );
	const rootPage = document.documentElement;
	const hasPageTheme = rootPage.hasAttribute( PAGE_THEME_ATTRIBUTE );
	const hasCustomTheme = ( element, attribute ) => {
		const theme = ( element.getAttribute( attribute ) || '' ).trim();

		return Boolean( theme ) && theme !== BASE_THEME;
	};
	const transitionSections = themedSections.filter( ( section ) => (
		section.classList.contains( 'section' ) && hasCustomTheme( section, THEME_ATTRIBUTE )
	) );
	const hasCustomPageTheme = hasPageTheme && hasCustomTheme( rootPage, PAGE_THEME_ATTRIBUTE );
	let transitionFrame = 0;

	if ( !themedSections.length ) {
		return () => {};
	}

	const getActivationOffset = () => {
		const viewportOffset = Math.max( 0, window.innerHeight - 100 );

		if ( !hero ) {
			return viewportOffset;
		}

		const heroBottomOffset = Math.max( 0, hero.getBoundingClientRect().bottom + window.scrollY );

		return Math.min( viewportOffset, heroBottomOffset );
	};

	const syncThemeState = () => {
		const activationOffset = getActivationOffset();
		const isActive = window.scrollY >= activationOffset;

		themedSections.forEach( ( section ) => {
			if ( isActive ) {
				section.setAttribute( ACTIVE_ATTRIBUTE, 'true' );
				return;
			}

			section.removeAttribute( ACTIVE_ATTRIBUTE );
		} );

		if ( hasPageTheme ) {
			if ( isActive ) {
				rootPage.setAttribute( PAGE_THEME_ACTIVE_ATTRIBUTE, 'true' );
				return;
			}

			rootPage.removeAttribute( PAGE_THEME_ACTIVE_ATTRIBUTE );
		}
	};

	const handleScroll = () => {
		syncThemeState();
	};

	const handleResize = () => {
		syncThemeState();
	};

	const enableThemeTransitions = () => {
		if ( hasCustomPageTheme ) {
			rootPage.classList.add( PAGE_THEME_TRANSITION_CLASS );
		}

		transitionSections.forEach( ( section ) => {
			section.classList.add( SECTION_THEME_TRANSITION_CLASS );
		} );
	};

	syncThemeState();
	transitionFrame = window.requestAnimationFrame( () => {
		transitionFrame = window.requestAnimationFrame( enableThemeTransitions );
	} );

	window.addEventListener( 'scroll', handleScroll, { passive: true } );
	window.addEventListener( 'resize', handleResize, { passive: true } );

	return () => {
		if ( transitionFrame ) {
			window.cancelAnimationFrame( transitionFrame );
		}

		window.removeEventListener( 'scroll', handleScroll );
		window.removeEventListener( 'resize', handleResize );
	};
};
