import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearTokens, setTokens } from '@/lib/auth';
import { AuthenticatedLayout } from './authenticated.layout';

const mockToastError = vi.fn();

vi.mock('react-toastify', () => ({
	toast: {
		error: (...args: unknown[]) => mockToastError(...args),
	},
}));

const AUTH_REDIRECT_MESSAGE = 'Falha de autenticação, redirecionando...';

function renderLayout() {
	return render(
		<MemoryRouter initialEntries={['/']}>
			<Routes>
				<Route element={<AuthenticatedLayout />}>
					<Route path="/" element={<div>Protected content</div>} />
				</Route>
				<Route path="/login" element={<div>Login page</div>} />
			</Routes>
		</MemoryRouter>,
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
