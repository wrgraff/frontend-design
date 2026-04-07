const STICKY_VIEWPORT_QUERY = '(min-width: 501px) and (max-width: 1599px)';

export const initHeaderStickyState = () => {
	const header = document.querySelector( '[data-header-sticky]' );

	if ( !header ) {
		return () => {};
	}

	const mediaQuery = window.matchMedia( STICKY_VIEWPORT_QUERY );

	const syncStickyState = () => {
		if ( !mediaQuery.matches ) {
			header.removeAttribute( 'data-stuck' );
			return;
		}

		if ( window.scrollY > 0 ) {
			header.setAttribute( 'data-stuck', 'true' );
			return;
		}

		header.removeAttribute( 'data-stuck' );
	};

	const handleScroll = () => {
		syncStickyState();
	};

	const handleViewportChange = () => {
		syncStickyState();
	};

	syncStickyState();
	window.addEventListener( 'scroll', handleScroll, { passive: true } );
	mediaQuery.addEventListener( 'change', handleViewportChange );

	return () => {
		window.removeEventListener( 'scroll', handleScroll );
		mediaQuery.removeEventListener( 'change', handleViewportChange );
	};
};
