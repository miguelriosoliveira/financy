import { type Mock, type Mocked, vi } from 'vitest';

/**
 * Builds a fully-typed mock of any interface or class. Each property access
 * lazily returns a cached vi.fn(), so the spy injected into the subject is the
 * same reference the test later asserts on.
 */
export function mockOf<T extends object>(): Mocked<T> {
	const cache = new Map<PropertyKey, Mock>();
	return new Proxy({} as Mocked<T>, {
		get(_target, prop) {
			let spy = cache.get(prop);
			if (!spy) {
				spy = vi.fn();
				cache.set(prop, spy);
			}
			return spy;
		},
	});
}
