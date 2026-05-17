const TABLE_SELECTOR = '[data-table-expandable]';
const ROW_SELECTOR = '[data-table-expandable-row]';
const COUNT_SELECTOR = '[data-table-expandable-count]';
const TOGGLE_SELECTOR = '[data-table-expandable-toggle]';
const BUTTON_TEXT_SELECTOR = '[data-button-text]';

const getRowsCountText = ( visibleRows, totalRows ) => {
	return `${ visibleRows } of ${ totalRows } rows`;
};

export const initExpandableTable = () => {
	const tables = document.querySelectorAll( TABLE_SELECTOR );
	const listeners = [];

	if ( !tables.length ) {
		return () => {};
	}

	tables.forEach( ( table ) => {
		const rows = Array.from( table.querySelectorAll( ROW_SELECTOR ) );
		const countElement = table.querySelector( COUNT_SELECTOR );
		const toggleButton = table.querySelector( TOGGLE_SELECTOR );
		const previewRows = Number.parseInt( table.dataset.tablePreviewRows, 10 );

		if ( !rows.length || !countElement || !toggleButton || !Number.isFinite( previewRows ) ) {
			return;
		}

		const totalRows = rows.length;
		const viewAllLabel = toggleButton.dataset.tableViewAllLabel || 'View all';
		const viewLessLabel = toggleButton.dataset.tableViewLessLabel || 'View less';
		const buttonText = toggleButton.querySelector( BUTTON_TEXT_SELECTOR );
		let isExpanded = false;

		const render = () => {
			rows.forEach( ( row, rowIndex ) => {
				row.hidden = !isExpanded && rowIndex >= previewRows;
			} );

			const visibleRows = isExpanded ? totalRows : previewRows;
			countElement.textContent = getRowsCountText( visibleRows, totalRows );
			toggleButton.setAttribute( 'aria-expanded', isExpanded ? 'true' : 'false' );

			if ( buttonText ) {
				buttonText.textContent = isExpanded ? viewLessLabel : viewAllLabel;
			}
		};

		const clickHandler = () => {
			isExpanded = !isExpanded;
			render();
		};

		render();
		toggleButton.addEventListener( 'click', clickHandler );
		listeners.push( () => toggleButton.removeEventListener( 'click', clickHandler ) );
	} );

	return () => {
		listeners.forEach( ( removeListener ) => removeListener() );
	};
};
