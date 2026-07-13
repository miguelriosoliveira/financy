import {
	ApolloClient,
	ApolloLink,
	CombinedGraphQLErrors,
	gql,
	InMemoryCache,
} from '@apollo/client';
import { ERROR_CODES } from '@financy/shared';
import { Observable } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	type ApolloClientDeps,
	createApolloClient,
	createErrorLink,
	createSingleFlightRefresh,
	type RefreshSessionResult,
	resetRefreshSessionStateForTests,
} from './apollo';

const TEST_QUERY = gql`
	query Test {
		health
	}
`;

function createUnauthenticatedError() {
	return new CombinedGraphQLErrors({
		errors: [{ message: 'Unauthorized', extensions: { code: ERROR_CODES.UNAUTHENTICATED } }],
	});
}

function createTestDeps(overrides: Partial<ApolloClientDeps> = {}): ApolloClientDeps {
	return {
		uri: 'http://localhost/graphql',
		getAccessToken: () => 'old-access-token',
		getRefreshTokenValue: () => 'old-refresh-token',
		updateSessionTokens: vi.fn(),
		clearSession: vi.fn(),
		refreshSession: vi.fn(async () => ({
			token: 'new-access-token',
			refreshToken: 'new-refresh-token',
		})),
		notifyRedirect: vi.fn(),
		navigateToLogin: vi.fn(),
		getPathname: () => '/dashboard',
		...overrides,
	};
}

function createRetryingLink(onRequest: () => ApolloLink.Result) {
	let attempts = 0;
	return new ApolloLink(() => {
		attempts += 1;
		return new Observable(observer => {
			if (attempts === 1) {
				observer.error(createUnauthenticatedError());
				return;
			}
			observer.next(onRequest());
			observer.complete();
		});
	});
}

describe('apollo auth links', () => {
	beforeEach(() => {
		resetRefreshSessionStateForTests();
	});

	it('refreshes the session and retries the operation once', async () => {
		const deps = createTestDeps();
		const client = new ApolloClient({
			link: ApolloLink.from([
				createErrorLink(deps),
				createRetryingLink(() => ({ data: { health: 'ok' } })),
			]),
			cache: new InMemoryCache(),
		});

		const result = await client.query({ query: TEST_QUERY });

		expect(result.data).toEqual({ health: 'ok' });
		expect(deps.refreshSession).toHaveBeenCalledTimes(1);
		expect(deps.updateSessionTokens).toHaveBeenCalledWith('new-access-token', 'new-refresh-token');
		expect(deps.clearSession).not.toHaveBeenCalled();
		expect(deps.navigateToLogin).not.toHaveBeenCalled();
	});

	it('deduplicates concurrent refresh attempts', async () => {
		let refreshCalls = 0;
		const refreshSession = vi.fn(async () => {
			refreshCalls += 1;
			await new Promise(resolve => setTimeout(resolve, 10));
			return {
				token: 'new-access-token',
				refreshToken: 'new-refresh-token',
			} satisfies RefreshSessionResult;
		});
		const deps = createTestDeps({
			refreshSession: createSingleFlightRefresh(refreshSession),
		});

		const [first, second] = await Promise.all([deps.refreshSession(), deps.refreshSession()]);

		expect(first).toEqual({
			token: 'new-access-token',
			refreshToken: 'new-refresh-token',
		});
		expect(second).toEqual(first);
		expect(refreshCalls).toBe(1);
		expect(refreshSession).toHaveBeenCalledTimes(1);
	});

	it('logs out when refresh fails', async () => {
		const deps = createTestDeps({
			refreshSession: vi.fn(async () => null),
		});
		const client = new ApolloClient({
			link: ApolloLink.from([
				createErrorLink(deps),
				createRetryingLink(() => ({ data: { health: 'ok' } })),
			]),
			cache: new InMemoryCache(),
		});

		await expect(client.query({ query: TEST_QUERY })).rejects.toBeDefined();

		expect(deps.refreshSession).toHaveBeenCalledTimes(1);
		expect(deps.clearSession).toHaveBeenCalledTimes(1);
		expect(deps.notifyRedirect).toHaveBeenCalledTimes(1);
		expect(deps.navigateToLogin).toHaveBeenCalledTimes(1);
	});

	it('does not redirect when already on the login page', async () => {
		const deps = createTestDeps({
			getPathname: () => '/login',
			refreshSession: vi.fn(async () => null),
		});
		const client = new ApolloClient({
			link: ApolloLink.from([
				createErrorLink(deps),
				createRetryingLink(() => ({ data: { health: 'ok' } })),
			]),
			cache: new InMemoryCache(),
		});

		await expect(client.query({ query: TEST_QUERY })).rejects.toBeDefined();

		expect(deps.clearSession).toHaveBeenCalledTimes(1);
		expect(deps.notifyRedirect).not.toHaveBeenCalled();
		expect(deps.navigateToLogin).not.toHaveBeenCalled();
	});

	it('wires the production client with refresh-aware links', () => {
		const client = createApolloClient(createTestDeps());
		expect(client.link).toBeDefined();
	});
});
