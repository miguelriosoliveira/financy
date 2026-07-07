import { MockedProvider } from '@apollo/client/testing/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { GET_ME } from '@/hooks/use-current-user';
import { clearTokens, setTokens } from '@/lib/auth';
import { AppRoutes } from './router';

const meMock = {
	request: { query: GET_ME },
	result: {
		data: {
			user: {
				id: 'user-1',
				name: 'Conta teste',
				email: 'conta@teste.com',
			},
		},
	},
};

function renderAt(path: string) {
	return render(
		<MockedProvider mocks={[meMock]}>
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
		setTokens('access-token', 'refresh-token', true);
		renderAt('/');
		expect(screen.getByText('HomePage')).toBeInTheDocument();
	});

	it('redirects authenticated users from unknown routes to home', () => {
		setTokens('access-token', 'refresh-token', true);
		renderAt('/unknown');
		expect(screen.getByText('HomePage')).toBeInTheDocument();
	});

	it('renders profile page for authenticated users', async () => {
		setTokens('access-token', 'refresh-token', true);
		renderAt('/profile');
		expect(await screen.findByText('Salvar alterações')).toBeInTheDocument();
		expect(screen.getByText('Sair da conta')).toBeInTheDocument();
	});
});
