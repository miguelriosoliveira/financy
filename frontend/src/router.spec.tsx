import { MockedProvider } from '@apollo/client/testing/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { clearTokens, setTokens } from '@/lib/auth';
import { AppRoutes } from './router';

function renderAt(path: string) {
	return render(
		<MockedProvider mocks={[]}>
			<MemoryRouter initialEntries={[path]}>
				<AppRoutes />
			</MemoryRouter>
		</MockedProvider>,
	);
}

describe('AppRoutes', () => {
	beforeEach(() => {
		clearTokens();
	});

	it('redirects unauthenticated users from home to login', () => {
		renderAt('/');

		expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
	});

	it('redirects unauthenticated users from unknown routes to login', () => {
		renderAt('/unknown');

		expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
	});

	it('renders home for authenticated users', () => {
		setTokens('access-token', 'refresh-token');

		renderAt('/');

		expect(screen.getByRole('heading', { name: 'Financy' })).toBeInTheDocument();
	});

	it('redirects authenticated users from unknown routes to home', () => {
		setTokens('access-token', 'refresh-token');

		renderAt('/unknown');

		expect(screen.getByRole('heading', { name: 'Financy' })).toBeInTheDocument();
	});
});
