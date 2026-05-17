export const initNoJs = () => {
	document.documentElement.classList.remove( 'no-js' );

	return () => {};
};
