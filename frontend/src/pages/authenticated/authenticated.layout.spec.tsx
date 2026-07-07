import { MockedProvider } from '@apollo/client/testing/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET_ME } from '@/hooks/use-current-user';
import { clearTokens, setTokens } from '@/lib/auth';
import { AuthenticatedLayout } from './authenticated.layout';

const mockToastError = vi.fn();

vi.mock('react-toastify', () => ({
	toast: {
		error: (...args: unknown[]) => mockToastError(...args),
	},
}));

const AUTH_REDIRECT_MESSAGE = 'Falha de autenticação, redirecionando...';

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

function renderLayout() {
	return render(
		<MockedProvider mocks={[meMock]}>
			<MemoryRouter initialEntries={['/']}>
				<Routes>
					<Route element={<AuthenticatedLayout />}>
						<Route path="/" element={<div>Protected content</div>} />
					</Route>
					<Route path="/login" element={<div>Login page</div>} />
				</Routes>
			</MemoryRouter>
		</MockedProvider>,
	);
}

describe('AuthenticatedLayout', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		clearTokens();
	});

	it('shows the auth redirect toast when unauthenticated', () => {
		renderLayout();

		expect(mockToastError).toHaveBeenCalledWith(AUTH_REDIRECT_MESSAGE, {
			toastId: 'auth-redirect',
		});
		expect(screen.getByText('Login page')).toBeInTheDocument();
	});

	it('does not show the auth redirect toast when authenticated', () => {
		setTokens('access-token', 'refresh-token', true);

		renderLayout();

		expect(mockToastError).not.toHaveBeenCalled();
		expect(screen.getByText('Protected content')).toBeInTheDocument();
	});
});
