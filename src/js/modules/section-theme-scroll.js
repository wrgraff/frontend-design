const ACTIVE_ATTRIBUTE = 'data-section-theme-active';
const PAGE_THEME_ACTIVE_ATTRIBUTE = 'data-page-theme-active';
const PAGE_THEME_ATTRIBUTE = 'data-page-theme';
const THEMED_SECTION_SELECTOR = '[data-section-theme]';
const HERO_SELECTOR = '[data-case-hero]';

export const initSectionThemeScroll = () => {
	const themedSections = Array.from( document.querySelectorAll( THEMED_SECTION_SELECTOR ) );
	const hero = document.querySelector( HERO_SELECTOR );
	const rootPage = document.documentElement;
	const hasPageTheme = rootPage.hasAttribute( PAGE_THEME_ATTRIBUTE );

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

	syncThemeState();
	window.addEventListener( 'scroll', handleScroll, { passive: true } );
	window.addEventListener( 'resize', handleResize, { passive: true } );

	return () => {
		window.removeEventListener( 'scroll', handleScroll );
		window.removeEventListener( 'resize', handleResize );
	};
};
