import { ApolloClient, CombinedGraphQLErrors, from, HttpLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { ERROR_CODES } from '@financy/shared';
import { env } from '../env.ts';
import { clearTokens, getToken } from './auth.ts';
import { notifyAuthRedirect } from './auth-feedback.ts';
import { navigateTo } from './navigation.ts';

const authLink = new SetContextLink(prev => {
	const token = getToken();
	return {
		headers: {
			...prev.headers,
			...(token ? { authorization: `Bearer ${token}` } : {}),
		},
	};
});

const errorLink = new ErrorLink(({ error }) => {
	if (
		CombinedGraphQLErrors.is(error) &&
		error.errors.some(graphQLError => graphQLError.extensions?.code === ERROR_CODES.UNAUTHENTICATED)
	) {
		clearTokens();
		if (window.location.pathname !== '/login') {
			notifyAuthRedirect();
			navigateTo('/login');
		}
	}
});

export const apolloClient = new ApolloClient({
	link: from([errorLink, authLink, new HttpLink({ uri: env.VITE_BACKEND_URL })]),
	cache: new InMemoryCache(),
});
