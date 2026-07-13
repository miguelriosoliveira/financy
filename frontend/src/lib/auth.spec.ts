import { beforeEach, describe, expect, it } from 'vitest';
import { clearTokens, getRefreshToken, getToken, setTokens, updateTokens } from './auth';

const TOKEN_KEY = 'financy.token';
const REFRESH_TOKEN_KEY = 'financy.refreshToken';

describe('auth token storage', () => {
	beforeEach(() => {
		clearTokens();
	});

	it('stores tokens in session storage by default', () => {
		setTokens('access-token', 'refresh-token', false);

		expect(sessionStorage.getItem(TOKEN_KEY)).toBe('access-token');
		expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh-token');
		expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
	});

	it('stores tokens in local storage when remember me is enabled', () => {
		setTokens('access-token', 'refresh-token', true);

		expect(localStorage.getItem(TOKEN_KEY)).toBe('access-token');
		expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh-token');
		expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull();
	});

	it('updates rotated tokens in the active storage', () => {
		setTokens('access-token', 'refresh-token', true);
		updateTokens('next-access-token', 'next-refresh-token');

		expect(getToken()).toBe('next-access-token');
		expect(getRefreshToken()).toBe('next-refresh-token');
		expect(localStorage.getItem(TOKEN_KEY)).toBe('next-access-token');
		expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('next-refresh-token');
	});

	it('clears tokens from both storage backends', () => {
		setTokens('access-token', 'refresh-token', true);
		clearTokens();

		expect(getToken()).toBeNull();
		expect(getRefreshToken()).toBeNull();
	});
});
