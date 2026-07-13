import {
	ApolloClient,
	ApolloLink,
	CombinedGraphQLErrors,
	HttpLink,
	InMemoryCache,
} from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { ERROR_CODES } from '@financy/shared';
import { from as rxFrom, switchMap } from 'rxjs';
import { env } from '../env.ts';
import { clearTokens, getRefreshToken, getToken, updateTokens } from './auth.ts';
import { notifyAuthRedirect } from './auth-feedback.ts';
import { navigateTo } from './navigation.ts';

const REFRESH_MUTATION = /* GraphQL */ `
	mutation RefreshToken($data: RefreshTokenInput!) {
		refreshToken(data: $data) {
			token
			refreshToken
		}
	}
`;

export type RefreshSessionResult = {
	token: string;
	refreshToken: string;
};

export type RefreshSession = () => Promise<RefreshSessionResult | null>;

export type ApolloClientDeps = {
	uri: string;
	getAccessToken: () => string | null;
	getRefreshTokenValue: () => string | null;
	updateSessionTokens: (token: string, refreshToken: string) => void;
	clearSession: () => void;
	refreshSession: RefreshSession;
	notifyRedirect: () => void;
	navigateToLogin: () => void;
	getPathname: () => string;
};

let inFlightRefresh: Promise<RefreshSessionResult | null> | null = null;

export function createRefreshSession(uri: string): RefreshSession {
	return async () => {
		const refreshToken = getRefreshToken();
		if (!refreshToken) {
			return null;
		}

		const response = await fetch(uri, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				query: REFRESH_MUTATION,
				variables: { data: { refreshToken } },
			}),
		});

		const payload = (await response.json()) as {
			data?: { refreshToken?: RefreshSessionResult };
			errors?: Array<{ extensions?: { code?: string } }>;
		};

		if (payload.errors?.length || !payload.data?.refreshToken) {
			return null;
		}

		return payload.data.refreshToken;
	};
}

export function resetRefreshSessionStateForTests() {
	inFlightRefresh = null;
}

export function createSingleFlightRefresh(refreshSession: RefreshSession): RefreshSession {
	return async () => {
		if (!inFlightRefresh) {
			inFlightRefresh = refreshSession().finally(() => {
				inFlightRefresh = null;
			});
		}
		return inFlightRefresh;
	};
}

function isUnauthenticated(error: unknown) {
	return (
		CombinedGraphQLErrors.is(error) &&
		error.errors.some(graphQLError => graphQLError.extensions?.code === ERROR_CODES.UNAUTHENTICATED)
	);
}

function logout(deps: ApolloClientDeps) {
	deps.clearSession();
	if (deps.getPathname() !== '/login') {
		deps.notifyRedirect();
		deps.navigateToLogin();
	}
}

export function createAuthLink(getAccessToken: () => string | null): ApolloLink {
	return new SetContextLink(prev => {
		const token = getAccessToken();
		return {
			headers: {
				...prev.headers,
				...(token ? { authorization: `Bearer ${token}` } : {}),
			},
		};
	});
}

export function createErrorLink(deps: ApolloClientDeps): ApolloLink {
	return new ErrorLink(({ error, operation, forward }) => {
		if (!isUnauthenticated(error)) {
			return;
		}

		const context = operation.getContext();
		if (context._authRetried) {
			logout(deps);
			return;
		}

		return rxFrom(deps.refreshSession()).pipe(
			switchMap(tokens => {
				if (!tokens) {
					logout(deps);
					throw error;
				}

				deps.updateSessionTokens(tokens.token, tokens.refreshToken);
				operation.setContext({
					...context,
					_authRetried: true,
					headers: {
						...context.headers,
						authorization: `Bearer ${tokens.token}`,
					},
				});
				return forward(operation);
			}),
		);
	});
}

export function createApolloClient(deps: ApolloClientDeps) {
	return new ApolloClient({
		link: ApolloLink.from([
			createErrorLink(deps),
			createAuthLink(deps.getAccessToken),
			new HttpLink({ uri: deps.uri }),
		]),
		cache: new InMemoryCache(),
	});
}

const defaultDeps: ApolloClientDeps = {
	uri: env.VITE_BACKEND_URL,
	getAccessToken: getToken,
	getRefreshTokenValue: getRefreshToken,
	updateSessionTokens: updateTokens,
	clearSession: clearTokens,
	refreshSession: createSingleFlightRefresh(createRefreshSession(env.VITE_BACKEND_URL)),
	notifyRedirect: notifyAuthRedirect,
	navigateToLogin: () => navigateTo('/login'),
	getPathname: () => window.location.pathname,
};

export const apolloClient = createApolloClient(defaultDeps);
