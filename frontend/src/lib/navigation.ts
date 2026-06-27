import type { NavigateFunction, To } from 'react-router';

let navigateRef: NavigateFunction | null = null;

export function setNavigate(navigate: NavigateFunction) {
	navigateRef = navigate;
}

export function navigateTo(to: To) {
	if (navigateRef) {
		navigateRef(to);
	} else {
		// Fallback before the bridge has mounted (e.g. very early errors).
		window.location.assign(typeof to === 'string' ? to : '/login');
	}
}
