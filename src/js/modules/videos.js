import { extractYoutubeId, extractYoutubeStart, generateYoutubeEmbedUrl } from './youtube.js';

const createIframe = ( id, start ) => {
	let iframe = document.createElement( 'iframe' );

	iframe.setAttribute( 'allowfullscreen', '' );
	iframe.setAttribute( 'allow', 'autoplay; encrypted-media; picture-in-picture' );
	iframe.setAttribute( 'title', 'YouTube video player' );
	iframe.setAttribute( 'src', generateYoutubeEmbedUrl( id, start, true ) );
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
			const start = video.dataset.start || extractYoutubeStart( videoUrl );
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
