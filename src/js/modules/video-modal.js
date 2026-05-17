import { extractYoutubeId, extractYoutubeStart, generateYoutubeEmbedUrl } from './youtube.js';

const createIframe = ( id, start ) => {
	const iframe = document.createElement( 'iframe' );

	iframe.setAttribute( 'allowfullscreen', '' );
	iframe.setAttribute( 'allow', 'autoplay; encrypted-media; picture-in-picture' );
	iframe.setAttribute( 'title', 'YouTube video player' );
	iframe.setAttribute( 'src', generateYoutubeEmbedUrl( id, start, true ) );
	iframe.classList.add( 'video-modal__iframe' );

	return iframe;
};

export const initVideoModal = () => {
	const dialog = document.querySelector( '[data-video-modal]' );
	const media = dialog ? dialog.querySelector( '[data-video-modal-media]' ) : null;
	const closeButton = dialog ? dialog.querySelector( '[data-video-modal-close]' ) : null;
	const triggers = document.querySelectorAll( '[data-video-modal-trigger]' );

	if ( !( dialog instanceof HTMLDialogElement ) || !media || !triggers.length ) {
		return () => {};
	}

	const listeners = [];
	let activeTrigger = null;
	let currentIframe = null;

	const clearIframe = () => {
		if ( !currentIframe ) {
			return;
		}

		currentIframe.remove();
		currentIframe = null;
	};

	const closeModal = ( shouldFocusTrigger = false ) => {
		if ( !dialog.open ) {
			return;
		}

		clearIframe();
		dialog.close();

		if ( shouldFocusTrigger && activeTrigger ) {
			activeTrigger.focus();
		}

		activeTrigger = null;
	};

	const openModal = ( trigger ) => {
		const videoUrl = trigger.getAttribute( 'href' ) || '';
		const id = extractYoutubeId( videoUrl );

		if ( !id ) {
			return;
		}

		const start = extractYoutubeStart( videoUrl );

		clearIframe();
		currentIframe = createIframe( id, start );
		media.appendChild( currentIframe );
		activeTrigger = trigger;
		dialog.showModal();
	};

	const handleTriggerClick = ( event ) => {
		event.preventDefault();
		openModal( event.currentTarget );
	};

	const handleDialogClick = ( event ) => {
		if ( event.target !== dialog ) {
			return;
		}

		closeModal( true );
	};

	const handleDialogCancel = ( event ) => {
		event.preventDefault();
		closeModal( true );
	};

	const handleDialogClose = () => {
		clearIframe();
		activeTrigger = null;
	};

	const handleCloseButtonClick = () => {
		closeModal( true );
	};

	triggers.forEach( ( trigger ) => {
		trigger.addEventListener( 'click', handleTriggerClick );
		listeners.push( () => trigger.removeEventListener( 'click', handleTriggerClick ) );
	} );

	dialog.addEventListener( 'click', handleDialogClick );
	listeners.push( () => dialog.removeEventListener( 'click', handleDialogClick ) );

	dialog.addEventListener( 'cancel', handleDialogCancel );
	listeners.push( () => dialog.removeEventListener( 'cancel', handleDialogCancel ) );

	dialog.addEventListener( 'close', handleDialogClose );
	listeners.push( () => dialog.removeEventListener( 'close', handleDialogClose ) );

	if ( closeButton ) {
		closeButton.addEventListener( 'click', handleCloseButtonClick );
		listeners.push( () => closeButton.removeEventListener( 'click', handleCloseButtonClick ) );
	}

	return () => {
		closeModal();
		listeners.forEach( ( removeListener ) => removeListener() );
	};
};
