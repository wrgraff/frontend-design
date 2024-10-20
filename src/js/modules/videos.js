class Videos {
	constructor() {
		this._video = document.querySelector( '.video' );
		this._link = this._video.querySelector( '.video__main-link' );
		this._media = this._video.querySelector( '.video__media' );
		this._img = this._video.querySelector( '.video__img' );
		this._button = this._video.querySelector( '.video__button' );

		this._videoElementClickHandler = this._videoElementClickHandler.bind( this );
	}

	init() {
		this._id = this._link.dataset.id;
		this._start = this._link.dataset.start;

		this._link.removeAttribute( 'href' );
		this._video.classList.add( 'video_enabled' );

		this._button.addEventListener( 'click', this._videoElementClickHandler );
	}

	_videoElementClickHandler( evt ) {
		evt.preventDefault();

		this._link.remove();
		this._img.remove();
		this._button.remove();
		let iframe = this._createIframe( this._id );
		this._media.appendChild( iframe );
	}

	_createIframe( id ) {
		let iframe = document.createElement( 'iframe' );

		iframe.setAttribute( 'allowfullscreen', '' );
		iframe.setAttribute( 'allow', 'autoplay' );
		iframe.setAttribute( 'src', this._generateURL( id ) );
		iframe.classList.add( 'video__iframe' );

		return iframe;
	}

	_generateURL( id ) {
		let query = '?rel=0&showinfo=0&autoplay=1';
		let time = '';
		if ( this._start !== 'false' ) {
			time = '&start=' + this._start;
		}

		return 'https://www.youtube.com/embed/' + id + query + time;
	}

	static create() {
		return new Videos().init();
	}
}

Videos.create();
