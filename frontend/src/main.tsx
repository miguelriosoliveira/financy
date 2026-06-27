import { ApolloProvider } from '@apollo/client/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import { apolloClient } from './lib/apollo.ts';
import { Router } from './router.tsx';
import './index.css';

// biome-ignore lint/style/noNonNullAssertion: 'root' is guaranteed to exist in the HTML file
createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ApolloProvider client={apolloClient}>
			<Router />
			<ToastContainer position="bottom-right" newestOnTop closeOnClick theme="colored" />
		</ApolloProvider>
	</StrictMode>,
);
