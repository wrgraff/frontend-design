const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

const isYoutubeHost = ( hostname ) => {
	return hostname.includes( 'youtube.com' ) || hostname.includes( 'youtu.be' );
};

export const extractYoutubeId = ( url ) => {
	if ( !url ) {
		return '';
	}

	let parsedUrl;
	try {
		parsedUrl = new URL( url );
	} catch ( error ) {
		return '';
	}

	if ( !isYoutubeHost( parsedUrl.hostname ) ) {
		return '';
	}

	let idFromPath = '';

	if ( parsedUrl.hostname.includes( 'youtu.be' ) ) {
		idFromPath = parsedUrl.pathname.replace( '/', '' );
	} else if ( parsedUrl.pathname.includes( '/embed/' ) ) {
		idFromPath = parsedUrl.pathname.split( '/embed/' )[1] || '';
	} else if ( parsedUrl.pathname.includes( '/shorts/' ) ) {
		idFromPath = parsedUrl.pathname.split( '/shorts/' )[1] || '';
	} else if ( parsedUrl.pathname.includes( '/live/' ) ) {
		idFromPath = parsedUrl.pathname.split( '/live/' )[1] || '';
	}

	const idFromQuery = parsedUrl.searchParams.get( 'v' ) || '';
	const rawId = ( idFromQuery || idFromPath ).split( '/' )[0].trim();

	if ( !YOUTUBE_ID_PATTERN.test( rawId ) ) {
		return '';
	}

	return rawId;
};

export const extractYoutubeStart = ( url ) => {
	if ( !url ) {
		return 'false';
	}

	let parsedUrl;
	try {
		parsedUrl = new URL( url );
	} catch ( error ) {
		return 'false';
	}

	const start = parsedUrl.searchParams.get( 'start' ) || parsedUrl.searchParams.get( 't' ) || '';

	if ( !start ) {
		return 'false';
	}

	const normalized = start.replace( 's', '' ).trim();

	if ( !/^\d+$/.test( normalized ) ) {
		return 'false';
	}

	return normalized;
};

export const generateYoutubeEmbedUrl = ( id, start = 'false', autoplay = true ) => {
	let query = `?rel=0&showinfo=0${autoplay ? '&autoplay=1' : ''}`;
	let time = '';

	if ( start !== 'false' && start !== '' ) {
		time = `&start=${start}`;
	}

	return `https://www.youtube.com/embed/${id}${query}${time}`;
};
