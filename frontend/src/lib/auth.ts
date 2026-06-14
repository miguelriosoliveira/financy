const TOKEN_KEY = 'financy.token';
const REFRESH_TOKEN_KEY = 'financy.refreshToken';

export function setTokens(token: string, refreshToken: string) {
	localStorage.setItem(TOKEN_KEY, token);
	localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getToken() {
	return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated() {
	return Boolean(getToken());
}
