const extractYoutubeId = ( url ) => {
	if ( !url ) {
		return '';
	}

	let parsedUrl;
	try {
		parsedUrl = new URL( url );
	} catch ( error ) {
		return '';
	}

	if ( parsedUrl.hostname.includes( 'youtu.be' ) ) {
		return parsedUrl.pathname.replace( '/', '' );
	}

	if ( parsedUrl.pathname.includes( '/embed/' ) ) {
		return parsedUrl.pathname.split( '/embed/' )[1] || '';
	}

	return parsedUrl.searchParams.get( 'v' ) || '';
};

const generateYoutubeUrl = ( id, start ) => {
	let query = '?rel=0&showinfo=0&autoplay=1';
	let time = '';

	if ( start !== 'false' && start !== '' ) {
		time = `&start=${start}`;
	}

	return `https://www.youtube.com/embed/${id}${query}${time}`;
};

const createIframe = ( id, start ) => {
	let iframe = document.createElement( 'iframe' );

	iframe.setAttribute( 'allowfullscreen', '' );
	iframe.setAttribute( 'allow', 'autoplay' );
	iframe.setAttribute( 'title', 'YouTube video player' );
	iframe.setAttribute( 'src', generateYoutubeUrl( id, start ) );
	iframe.classList.add( 'video__iframe' );

	return iframe;
};

export const initVideos = ( selectors = ['video', 'promo-video'] ) => {
	const listeners = [];

	selectors.forEach( ( selector ) => {
		const videos = document.querySelectorAll( `.${selector}` );

		videos.forEach( ( video ) => {
			const media = video.querySelector( `.${selector}__media` );
			const image = video.querySelector( `.${selector}__img` );
			const footer = video.querySelector( `.${selector}__footer` );
			const button = video.querySelector( `.${selector}__button` );
			const videoUrl = video.dataset.videoUrl || '';
			const start = video.dataset.start || 'false';
			const id = extractYoutubeId( videoUrl );

			if ( !media || !button || !footer || !id ) {
				return;
			}

			video.classList.add( `${selector}_enabled` );

			const videoElementClickHandler = ( evt ) => {
				evt.preventDefault();

				if ( image ) {
					image.remove();
				}
				footer.remove();
				button.removeEventListener( 'click', videoElementClickHandler );
				media.appendChild( createIframe( id, start ) );
			};

			button.addEventListener( 'click', videoElementClickHandler );
			listeners.push( () => button.removeEventListener( 'click', videoElementClickHandler ) );
		} );
	} );

	return () => {
		listeners.forEach( ( removeListener ) => removeListener() );
	};
};
