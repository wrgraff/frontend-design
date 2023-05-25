import MicroModal from 'micromodal';
import { createElement } from './createElement';
import { ScrollLock } from './scroll-lock';

const templates = {
	modal() {
		return `
			<section id="modal" class="modal micromodal-slide" aria-hidden="true">
				<div class="modal__overlay" tabindex="-1" data-micromodal-close></div>
			</section>
		`;
	},
	case() {
		return `
			<div class="modal__container case" role="dialog" aria-modal="true"></div>
		`;
	},
	title( title ) {
		return `
			<h2 class="visually-hidden">${title}</h2>
		`;
	},
	loading() {
		return `
			<div class="case__loading">
				<span class="visually-hidden">Loading</span>
			</div>
		`;
	},
	article() {
		return `
			<article class="case__article article">
				<h3 class="visually-hidden">Case description</h3>
				<ul class="article__list"></ul>
			</article>
		`;
	},
	articleImg( url ) {
		return `
			<li class="article__item">
				<picture class="article__picture">
					<img src="${url}" alt="">
				</picture>
			</li>
		`;
	},
	details() {
		return `
			<section class="case__details details">
				<h3 class="visually-hidden">Additional details</h3>
			</section>
		`;
	},
	detailsList() {
		return `
			<ul class="details__list"></ul>
		`;
	},
	detailsItem( tag ) {
		return `
			<li class="details__item">
				<span class="label">${tag}</span>
			</li>
		`;
	},
	detailsButton( url ) {
		return `
			<a href="${url}#comment" class="details__button button button_secondary button_small_m button_l button_ico_message" target="_blank">Comment on Behance</a>
		`;
	},
	nav() {
		return `
			<nav class="case__nav">
				<div class="case__side case__side_left"></div>

				<div class="case__side case__side_right">
					<div class="case__side-contacts side-contacts">
						<div class="side-contacts__me me me_small">
							<img src="/img/me.png" class="me__img" alt="" aria-hidden="true">
						</div>

						<ul class="side-contacts__list">
							<li class="side-contacts__item">
								<a href="mailto:hello@frontend-design.ru" class="ico-button ico-button_l ico-button_rounded ico-button_secondary ico-button_email">
									<span class="visually-hidden">hello@frontend-design.ru</span>
								</a>
							</li>
						</ul>
					</div>
				</div>
			</nav>
		`;
	},
	navBehance( url ) {
		return `
			<li class="side-contacts__item">
				<a href="${url}" class="ico-button ico-button_l ico-button_rounded ico-button_secondary ico-button_behance">
					<span class="visually-hidden">Me on Behance</span>
				</a>
			</li>
		`;
	},
	previousButton() {
		return `
			<button type="button" class="case__control case__control_previous ico-button ico-button_xl ico-button_rounded ico-button_secondary ico-button_previous">
				<span class="visually-hidden">Previous case</span>
			</button>
		`;
	},
	nextButton() {
		return `
			<button type="button" class="case__control case__control_next ico-button ico-button_xl ico-button_rounded ico-button_secondary ico-button_next">
				<span class="visually-hidden">Previous case</span>
			</button>
		`;
	},
	closeButton() {
		return `
			<button type="button" class="case__close ico-button ico-button_l ico-button_small_xl ico-button_rounded ico-button_secondary ico-button_close" data-micromodal-close>
				<span class="visually-hidden">Close modal</span>
			</button>
		`;
	},
};

class PortfolioLoader {
	constructor() {
		this._micromodal = MicroModal;
		this._scrollLock = new ScrollLock();
		this._linkElements = document.querySelectorAll( '.portfolio__link[href]:not([target="_blank"])' );

		this._modalElement = createElement( templates.modal() );
		this._caseElement = createElement( templates.case() );
		this._modalElement.querySelector( '.modal__overlay' ).append( this._caseElement );
		this._loadingElement = null;
		this._titleElement = null;
		this._articleElement = null;
		this._detailsElement = null;
		this._detailsListElement = null;
		this._detailsButtonElement = null;
		this._navElement = null;
		this._previousButtonElement = null;
		this._nextButtonElement = null;
		this._closeButtonElement = null;
		this._navBehanceElement = null;

		this._previousUrl = null;
		this._nextUrl = null;

		this._linkElementClickHandler = this._linkElementClickHandler.bind( this );
		this._previousButtonElementHandler = this._previousButtonElementHandler.bind( this );
		this._nextButtonElementHandler = this._nextButtonElementHandler.bind( this );
	}

	init() {
		document.body.append( this._modalElement );
		this._micromodal.init();

		this._linkElements.forEach( ( link ) => link.addEventListener( 'click', this._linkElementClickHandler ) );
	}

	_loadData( url ) {
		fetch( url )
				.then( ( response ) => response.json() )
				.then( ( data ) => {
					this._previousUrl = data.nav.previousUrl;
					this._nextUrl = data.nav.nextUrl;
					this._renderCase( data );
				} );
	}

	_renderLoadingState() {
		if ( !this._loadingElement ) {
			this._loadingElement = createElement( templates.loading() );
		}

		this._caseElement.append( this._loadingElement );
	}

	_renderCase( { title, imgs, tags, behance } ) {
		this._renderTitle( title );
		this._renderArticle( imgs );
		this._renderDetails( tags, behance );
		this._renderNav();
		this._renderNavBehance( behance );
		this._removeLoadingState();
	}

	_renderTitle( title ) {
		this._titleElement = createElement( templates.title( title ) );
		this._caseElement.append( this._titleElement );
	}

	_renderArticle( imgs ) {
		this._articleElement = createElement( templates.article() );
		imgs.forEach( ( imgUrl ) => this._articleElement.querySelector( '.article__list' ).append( createElement( templates.articleImg( imgUrl ) ) ) );
		this._caseElement.prepend( this._articleElement );
	}

	_renderDetails( tags, behance ) {
		if ( !tags.length > 0 && !behance ) {
			this._detailsElement.remove();
			this._detailsElement = null;
			return;
		}

		this._detailsElement = createElement( templates.details() );

		if ( tags.length > 0 ) {
			this._detailsListElement = createElement( templates.detailsList() );
			tags.forEach( ( tag ) => this._detailsListElement.append( createElement( templates.detailsItem( tag ) ) ) );
			this._detailsElement.append( this._detailsListElement );
		} else {
			this._detailsListElement.remove();
			this._detailsListElement = null;
		}

		if ( behance ) {
			this._detailsButtonElement = createElement( templates.detailsButton( behance ) );
			this._detailsElement.append( this._detailsButtonElement );
		} else {
			this._detailsButtonElement.remove();
			this._detailsButtonElement = null;
		}

		this._caseElement.append( this._detailsElement );
	}

	_renderNav() {
		if ( !this._navElement ) {
			this._navElement = createElement( templates.nav() );
			this._caseElement.append( this._navElement );

			this._nextButtonElement = createElement( templates.nextButton() );
			this._navElement.querySelector( '.case__side_right' ).append( this._nextButtonElement );

			this._closeButtonElement = createElement( templates.closeButton() );
			this._navElement.querySelector( '.case__side_left' ).append( this._closeButtonElement );

			this._previousButtonElement = createElement( templates.previousButton() );
			this._navElement.querySelector( '.case__side_left' ).append( this._previousButtonElement );

			this._previousButtonElement.addEventListener( 'click', this._previousButtonElementHandler );
			this._nextButtonElement.addEventListener( 'click', this._nextButtonElementHandler );
		}
	}

	_renderNavBehance( behance ) {
		if ( behance ) {
			this._navBehanceElement = createElement( templates.navBehance( behance ) );
			this._navElement.querySelector( '.side-contacts__list' ).append( this._navBehanceElement );
		} else {
			this._navBehanceElement.remove();
			this._navBehanceElement = null;
		}
	}

	_removeLoadingState() {
		this._loadingElement.remove();
	}

	_removeCaseContent() {
		this._titleElement.remove();
		this._titleElement = null;

		this._articleElement.remove();
		this._articleElement = null;

		this._detailsElement.remove();
		this._detailsElement = null;

		this._detailsListElement.remove();
		this._detailsListElement = null;

		this._detailsButtonElement.remove();
		this._detailsButtonElement = null;

		this._navBehanceElement.remove();
		this._navBehanceElement = null;
	}

	_remove() {
		this._removeCaseContent();

		this._navElement.remove();
		this._navElement = null;
		this._previousButtonElement.remove();
		this._previousButtonElement = null;
		this._nextButtonElement.remove();
		this._nextButtonElement = null;
		this._closeButtonElement.remove();
		this._closeButtonElement = null;

		this._previousUrl = null;
		this._nextUrl = null;

		this._scrollLock.enableScrolling();
	}

	_linkElementClickHandler( evt ) {
		evt.preventDefault();

		this._renderLoadingState();
		this._scrollLock.disableScrolling();
		this._micromodal.show( 'modal', {
			onClose: () => {
				this._remove();
			},
		} );

		this._loadData( `${evt.target.href}index.json` );
	}

	_previousButtonElementHandler( evt ) {
		evt.preventDefault();
		this._removeCaseContent();
		this._renderLoadingState();
		this._loadData( `${this._previousUrl}index.json` );
	}

	_nextButtonElementHandler( evt ) {
		evt.preventDefault();
		this._removeCaseContent();
		this._renderLoadingState();
		this._loadData( `${this._nextUrl}index.json` );
	}

	static create() {
		return new PortfolioLoader().init();
	}
}

PortfolioLoader.create();
