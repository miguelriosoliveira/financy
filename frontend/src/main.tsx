import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import { env } from './env.ts';
import './index.css';

const client = new ApolloClient({
	link: new HttpLink({ uri: env.VITE_BACKEND_URL }),
	cache: new InMemoryCache(),
});

// biome-ignore lint/style/noNonNullAssertion: 'root' is guaranteed to exist in the HTML file
createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ApolloProvider client={client}>
			<App />
		</ApolloProvider>
	</StrictMode>,
);
