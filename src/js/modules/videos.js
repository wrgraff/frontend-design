class Videos {
	constructor( selectors = [] ) {
		this._selectors = selectors;
		this._videoElementClickHandler = this._videoElementClickHandler.bind( this );
		this._selectors.forEach( ( selector ) => {
			let element = document.querySelector( `.${selector}` );
			if ( !element ) {
				return;
			}
			this.init( selector, element );
		} );
	}

	init( selector, element ) {
		this._video = element;
		this._media = this._video.querySelector( `.${selector}__media` );
		this._img = this._video.querySelector( `.${selector}__img` );
		this._footer = this._video.querySelector( `.${selector}__footer` );
		this._button = this._video.querySelector( `.${selector}__button` );
		this._videoUrl = this._video.dataset.videoUrl || '';
		this._start = this._video.dataset.start || 'false';
		this._id = this._extractYoutubeId( this._videoUrl );

		if ( !this._media || !this._button || !this._footer || !this._id ) {
			return;
		}

		this._video.classList.add( `${selector}_enabled` );
		this._button.addEventListener( 'click', this._videoElementClickHandler );
	}

	_videoElementClickHandler( evt ) {
		evt.preventDefault();

		if ( this._img ) {
			this._img.remove();
		}
		this._footer.remove();

		let iframe = this._createIframe( this._id );
		this._media.appendChild( iframe );
	}

	_createIframe( id ) {
		let iframe = document.createElement( 'iframe' );

		iframe.setAttribute( 'allowfullscreen', '' );
		iframe.setAttribute( 'allow', 'autoplay' );
		iframe.setAttribute( 'title', 'YouTube video player' );
		iframe.setAttribute( 'src', this._generateURL( id ) );
		iframe.classList.add( 'video__iframe' );

		return iframe;
	}

	_generateURL( id ) {
		let query = '?rel=0&showinfo=0&autoplay=1';
		let time = '';

		if ( this._start !== 'false' && this._start !== '' ) {
			time = '&start=' + this._start;
		}

		return 'https://www.youtube.com/embed/' + id + query + time;
	}

	_extractYoutubeId( url ) {
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
	}

	static create( selectors ) {
		return new Videos( selectors );
	}
}

Videos.create( ['video', 'promo-video'] );
