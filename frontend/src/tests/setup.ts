import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom does not implement ResizeObserver, but some Radix UI primitives (e.g. the
// Checkbox on the login page) instantiate one on mount, which would otherwise throw
// "ResizeObserver is not defined". jsdom performs no layout, so a no-op stub is enough.
if (!globalThis.ResizeObserver) {
	globalThis.ResizeObserver = class ResizeObserverMock {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
}

// Radix Select relies on pointer capture APIs that jsdom does not implement.
if (!Element.prototype.hasPointerCapture) {
	Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
	Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
	Element.prototype.releasePointerCapture = () => {};
}
if (!Element.prototype.scrollIntoView) {
	Element.prototype.scrollIntoView = () => {};
}

afterEach(() => {
	cleanup();
});
