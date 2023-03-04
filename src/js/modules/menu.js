class Menu {
	constructor() {
		this._buttonElement = document.querySelector('.aside__toggler');
		this._menuElement = document.querySelector('.page__aside');

		this._buttonElementClickHandler = this._buttonElementClickHandler.bind(this);
	}

	init() {
		this._buttonElement.addEventListener('click', this._buttonElementClickHandler);
	}

	_buttonElementClickHandler(evt) {
		evt.preventDefault();

		this._menuElement.classList.toggle('page__aside_opened');
		this._menuElement.classList.toggle('aside_opened');
		this._buttonElement.classList.toggle('ico-button_menu');
		this._buttonElement.classList.toggle('ico-button_menu-close');
	}

	static create() {
		return new Menu().init();
	}
}

Menu.create();
