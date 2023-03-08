import MicroModal from 'micromodal';

class PortfolioLoader {
	constructor() {
		this._linkElements = document.querySelectorAll('.portfolio__link[href]');
		this._linkElementClickHandler = this._linkElementClickHandler.bind(this);
		this._modalElement = this._createModalElement();
	}

	init() {
		MicroModal.init();

		this._linkElements.forEach(link => {
			link.addEventListener('click', this._linkElementClickHandler);
		});
	}

	_createModalContentTemplate(heading, content) {
		return `
			<div tabindex="-1" data-micromodal-close>
				<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
					<header>
						<h2 id="modal-title">
							${ heading }
						</h2>
						<button aria-label="Close modal" data-micromodal-close></button>
					</header>

					<div id="modal-content">
						${ content }
					</div>
				</div>
			</div>
		`
	}

	_createModalElement() {
		const modalElement = document.createElement('div');
		modalElement.classList.add('modal');
		modalElement.setAttribute('id', 'modal');
		modalElement.setAttribute('aria-hidden', 'true');

		return modalElement;
	}

	_loadHTML(url) {
		fetch(url)
		.then( response => response.text() )
		.then( text => {
			const element = document.createElement('div');
			element.innerHTML = text;

			const caseContent = element.querySelector('.case');
			const headingElement = caseContent.querySelector('h1');
			const heading = headingElement.textContent;
			headingElement.remove();

			const headerElement = caseContent.querySelector('.case__header');
			headerElement.remove();

			this._modalElement.innerHTML = this._createModalContentTemplate( heading, caseContent.innerHTML );
			document.body.append(this._modalElement);
			MicroModal.show('modal');
		} );
	}

	_linkElementClickHandler(evt) {
		evt.preventDefault();
		console.log(evt.target.href);
		this._loadHTML(evt.target.href);
	}

	static create() {
		return new PortfolioLoader().init();
	}
}

PortfolioLoader.create();
