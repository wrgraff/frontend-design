import { iosChecker } from './ios-checker.js';

export class ScrollLock {
	constructor() {
		this._iosChecker = iosChecker;
		this._lockClass = this._iosChecker() ? 'page__body_lock-ios' : 'page__body_lock';
		this._scrollTop = null;
		this._fixedBlockElements = document.querySelectorAll( '[data-fix-block]' );
	}

	_getScrollbarWidth() {
		return window.innerWidth - document.documentElement.clientWidth;
	}

	_getBodyScrollTop() {
		return (
			self.pageYOffset ||
      ( document.documentElement && document.documentElement.ScrollTop ) ||
      ( document.body && document.body.scrollTop )
		);
	}

	disableScrolling() {
		this._scrollTop = document.body.dataset.scroll = document.body.dataset.scroll ? document.body.dataset.scroll : this._getBodyScrollTop();
		if ( this._getScrollbarWidth() ) {
			document.body.style.paddingRight = `${this._getScrollbarWidth()}px`;
			this._fixedBlockElements.forEach( ( block ) => {
				block.style.paddingRight = `${this._getScrollbarWidth()}px`;
			} );
		}
		document.body.style.top = `-${this._scrollTop}px`;
		document.body.classList.add( this._lockClass );
	}

	enableScrolling() {
		document.body.classList.remove( this._lockClass );
		window.scrollTo( 0, +document.body.dataset.scroll );
		document.body.style.paddingRight = null;
		document.body.style.top = null;
		this._fixedBlockElements.forEach( ( block ) => {
			block.style.paddingRight = null;
		} );
		document.body.removeAttribute( 'data-scroll' );
		this._scrollTop = null;
	}
}

window.scrollLock = new ScrollLock();
