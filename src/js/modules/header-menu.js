const DESKTOP_MEDIA_QUERY = '(min-width: 1600px)';
const MENU_ICON_PATHS = `
	<path d="M17 6C17.5523 6 18 6.44772 18 7C18 7.55228 17.5523 8 17 8H5C4.44772 8 4 7.55228 4 7C4 6.44772 4.44772 6 5 6H17Z" class="icon__part icon__part_premium"></path>
	<path d="M27 15C27.5523 15 28 15.4477 28 16C28 16.5523 27.5523 17 27 17H5C4.44772 17 4 16.5523 4 16C4 15.4477 4.44772 15 5 15H27Z" class="icon__part icon__part_premium"></path>
	<path d="M22 24C22.5523 24 23 24.4477 23 25C23 25.5523 22.5523 26 22 26H5C4.44772 26 4 25.5523 4 25C4 24.4477 4.44772 24 5 24H22Z" class="icon__part icon__part_alt"></path>
`;
const CLOSE_ICON_PATHS = `
	<path d="M26.293 4.29302C26.6835 3.90249 27.3165 3.90249 27.707 4.29302C28.0975 4.68354 28.0975 5.31655 27.707 5.70708L5.70702 27.7071C5.31649 28.0976 4.68348 28.0976 4.29295 27.7071C3.90243 27.3166 3.90243 26.6835 4.29295 26.293L26.293 4.29302Z" class="icon__part icon__part_premium"/>
	<path d="M4.29295 4.29302C4.68348 3.90249 5.31649 3.90249 5.70702 4.29302L27.707 26.293C28.0975 26.6835 28.0975 27.3166 27.707 27.7071C27.3165 28.0976 26.6835 28.0976 26.293 27.7071L4.29295 5.70708C3.90243 5.31655 3.90243 4.68354 4.29295 4.29302Z" class="icon__part icon__part_premium"/>
`;

export const initHeaderMenu = () => {
	const headerMenuRoot = document.querySelector( '[data-header-menu-root]' );

	if ( !headerMenuRoot ) {
		return () => {};
	}

	const toggle = headerMenuRoot.querySelector( 'button[type="button"]' );
	const panel = headerMenuRoot.querySelector( '[data-header-menu-panel]' );

	if ( !toggle || !panel ) {
		return () => {};
	}

	const toggleIcon = toggle.querySelector( '.button__icon_position_left' );

	if ( !panel.id ) {
		panel.id = 'header-menu-panel';
	}

	toggle.setAttribute( 'aria-controls', panel.id );
	toggle.setAttribute( 'aria-expanded', 'false' );
	toggle.setAttribute( 'aria-haspopup', 'menu' );
	panel.hidden = true;

	const setToggleIcon = ( isMenuOpen ) => {
		if ( !toggleIcon ) {
			return;
		}

		toggleIcon.innerHTML = isMenuOpen ? CLOSE_ICON_PATHS : MENU_ICON_PATHS;
	};

	setToggleIcon( false );

	let isOpen = false;

	const closeMenu = ( shouldFocusToggle = false ) => {
		if ( !isOpen ) {
			return;
		}

		isOpen = false;
		panel.hidden = true;
		toggle.setAttribute( 'aria-expanded', 'false' );
		setToggleIcon( false );

		if ( shouldFocusToggle ) {
			toggle.focus();
		}
	};

	const openMenu = () => {
		if ( isOpen ) {
			return;
		}

		isOpen = true;
		panel.hidden = false;
		toggle.setAttribute( 'aria-expanded', 'true' );
		setToggleIcon( true );
	};

	const toggleMenu = () => {
		if ( isOpen ) {
			closeMenu();
			return;
		}

		openMenu();
	};

	const handleToggleClick = () => {
		toggleMenu();
	};

	const handleDocumentClick = ( event ) => {
		if ( !isOpen ) {
			return;
		}

		if ( headerMenuRoot.contains( event.target ) ) {
			return;
		}

		closeMenu();
	};

	const handleDocumentKeydown = ( event ) => {
		if ( !isOpen ) {
			return;
		}

		if ( event.key !== 'Escape' ) {
			return;
		}

		closeMenu( true );
	};

	const handlePanelClick = ( event ) => {
		const link = event.target.closest( 'a[href]' );

		if ( !link ) {
			return;
		}

		closeMenu();
	};

	const desktopMedia = window.matchMedia( DESKTOP_MEDIA_QUERY );
	const handleViewportChange = ( event ) => {
		if ( !event.matches ) {
			return;
		}

		closeMenu();
	};

	toggle.addEventListener( 'click', handleToggleClick );
	document.addEventListener( 'click', handleDocumentClick );
	document.addEventListener( 'keydown', handleDocumentKeydown );
	panel.addEventListener( 'click', handlePanelClick );
	desktopMedia.addEventListener( 'change', handleViewportChange );

	return () => {
		toggle.removeEventListener( 'click', handleToggleClick );
		document.removeEventListener( 'click', handleDocumentClick );
		document.removeEventListener( 'keydown', handleDocumentKeydown );
		panel.removeEventListener( 'click', handlePanelClick );
		desktopMedia.removeEventListener( 'change', handleViewportChange );
	};
};
