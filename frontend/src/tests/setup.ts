import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom does not implement ResizeObserver, but some Radix UI primitives (e.g. the
// Checkbox on the login page) instantiate one on mount, which would otherwise throw
// "ResizeObserver is not defined". jsdom performs no layout, so a no-op stub is enough.
globalThis.ResizeObserver = class ResizeObserverMock {
	observe() {}
	unobserve() {}
	disconnect() {}
};

afterEach(() => {
	cleanup();
});
