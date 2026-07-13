const TOKEN_KEY = 'financy.token';
const REFRESH_TOKEN_KEY = 'financy.refreshToken';

function readFromStores(key: string) {
	return localStorage.getItem(key) ?? sessionStorage.getItem(key);
}

function getActiveStore() {
	if (localStorage.getItem(TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY)) {
		return localStorage;
	}
	if (sessionStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY)) {
		return sessionStorage;
	}
	return null;
}

export function setTokens(token: string, refreshToken: string, rememberMe: boolean) {
	clearTokens();
	const store = rememberMe ? localStorage : sessionStorage;
	store.setItem(TOKEN_KEY, token);
	store.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function updateTokens(token: string, refreshToken: string) {
	const store = getActiveStore() ?? sessionStorage;
	store.setItem(TOKEN_KEY, token);
	store.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
	for (const store of [localStorage, sessionStorage]) {
		store.removeItem(TOKEN_KEY);
		store.removeItem(REFRESH_TOKEN_KEY);
	}
}

export function getToken() {
	return readFromStores(TOKEN_KEY);
}

export function getRefreshToken() {
	return readFromStores(REFRESH_TOKEN_KEY);
}

export function isAuthenticated() {
	return Boolean(getToken());
}
