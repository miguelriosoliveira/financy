import { gql } from '@apollo/client';
import type { MockLink } from '@apollo/client/testing';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearTokens, getToken } from '@/lib/auth';
import { renderWithProviders } from '@/tests/helpers/render';
import { LoginPage } from './login.page';

const mockNavigate = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock('react-router', async () => {
	const actual = await vi.importActual<typeof import('react-router')>('react-router');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

vi.mock('react-toastify', () => ({
	toast: {
		success: (...args: unknown[]) => mockToastSuccess(...args),
		error: (...args: unknown[]) => mockToastError(...args),
	},
}));

const TOKEN_KEY = 'financy.token';
const REFRESH_TOKEN_KEY = 'financy.refreshToken';

const LOGIN = gql`
	mutation Login($data: LoginInput!) {
		login(data: $data) {
			token
			refreshToken
		}
	}
`;

const VALID_LOGIN = {
	email: 'ada@example.com',
	password: 'secret123',
};

const LOGIN_FIELD_MESSAGES = {
	email: 'Informe um e-mail válido',
	password: 'Informe uma senha válida',
} as const;

function createLoginSuccessMock(data = VALID_LOGIN): MockLink.MockedResponse {
	return {
		request: {
			query: LOGIN,
			variables: { data },
		},
		result: {
			data: {
				login: {
					token: 'access-token',
					refreshToken: 'refresh-token',
				},
			},
		},
	};
}

function createLoginErrorMock(data = VALID_LOGIN): MockLink.MockedResponse {
	return {
		request: {
			query: LOGIN,
			variables: { data },
		},
		error: new Error('Invalid credentials'),
	};
}

async function fillLoginForm(data: { email: string; password: string }) {
	const user = userEvent.setup();

	if (data.email) {
		await user.type(screen.getByLabelText('E-mail'), data.email);
	}
	if (data.password) {
		await user.type(screen.getByLabelText('Senha'), data.password);
	}

	return user;
}

describe('LoginPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		clearTokens();
	});

	it('renders the login form fields and submit button', () => {
		renderWithProviders(<LoginPage />);

		expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
		expect(screen.getByLabelText('Senha')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
	});

	it('toggles password visibility', async () => {
		renderWithProviders(<LoginPage />);

		const passwordInput = screen.getByLabelText('Senha');
		const passwordGroup = passwordInput.closest('[data-slot="input-group"]');

		expect(passwordGroup).not.toBeNull();
		expect(passwordInput).toHaveAttribute('type', 'password');

		const toggleButton = within(passwordGroup as HTMLElement).getByRole('button');
		const user = userEvent.setup();

		await user.click(toggleButton);
		expect(passwordInput).toHaveAttribute('type', 'text');

		await user.click(toggleButton);
		expect(passwordInput).toHaveAttribute('type', 'password');
	});

	it.each([
		{
			label: 'invalid email',
			data: { email: 'not-an-email', password: 'secret123' },
			field: 'email' as const,
			message: LOGIN_FIELD_MESSAGES.email,
		},
		{
			label: 'short password',
			data: { email: 'ada@example.com', password: 'short' },
			field: 'password' as const,
			message: LOGIN_FIELD_MESSAGES.password,
		},
	])('rejects login with $label', async ({ data, field, message }) => {
		renderWithProviders(<LoginPage />, {
			mocks: [createLoginSuccessMock()],
		});

		const user = await fillLoginForm(data);
		await user.click(screen.getByRole('button', { name: 'Entrar' }));

		expect(await screen.findByText(message)).toBeInTheDocument();

		if (field === 'email') {
			expect(screen.queryByText(LOGIN_FIELD_MESSAGES.password)).not.toBeInTheDocument();
		}

		if (field === 'password') {
			expect(screen.queryByText(LOGIN_FIELD_MESSAGES.email)).not.toBeInTheDocument();
		}

		expect(mockNavigate).not.toHaveBeenCalled();
		expect(mockToastSuccess).not.toHaveBeenCalled();
		expect(mockToastError).not.toHaveBeenCalled();
	});

	it('logs in with a trimmed/lowercased email and redirects home', async () => {
		renderWithProviders(<LoginPage />, {
			mocks: [
				createLoginSuccessMock({
					email: 'ada@example.com',
					password: 'secret123',
				}),
			],
		});

		const user = await fillLoginForm({
			email: '  ADA@Example.COM ',
			password: 'secret123',
		});

		await user.click(screen.getByRole('button', { name: 'Entrar' }));

		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith('/');
		});

		expect(getToken()).toBe('access-token');
		expect(mockToastSuccess).not.toHaveBeenCalled();
		expect(mockToastError).not.toHaveBeenCalled();
	});

	it('stores tokens in sessionStorage when remember me is unchecked', async () => {
		renderWithProviders(<LoginPage />, {
			mocks: [createLoginSuccessMock()],
		});

		const user = await fillLoginForm(VALID_LOGIN);
		await user.click(screen.getByRole('button', { name: 'Entrar' }));

		await waitFor(() => {
			expect(sessionStorage.getItem(TOKEN_KEY)).toBe('access-token');
		});

		expect(mockToastSuccess).not.toHaveBeenCalled();
		expect(sessionStorage.getItem(TOKEN_KEY)).toBe('access-token');
		expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh-token');
		expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
		expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
	});

	it('stores tokens in localStorage when remember me is checked', async () => {
		renderWithProviders(<LoginPage />, {
			mocks: [createLoginSuccessMock()],
		});

		const user = await fillLoginForm(VALID_LOGIN);
		await user.click(screen.getByLabelText('Lembrar-me'));
		await user.click(screen.getByRole('button', { name: 'Entrar' }));

		await waitFor(() => {
			expect(localStorage.getItem(TOKEN_KEY)).toBe('access-token');
		});

		expect(mockToastSuccess).not.toHaveBeenCalled();
		expect(localStorage.getItem(TOKEN_KEY)).toBe('access-token');
		expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh-token');
		expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull();
		expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
	});

	it('shows an error toast when login fails', async () => {
		renderWithProviders(<LoginPage />, {
			mocks: [createLoginErrorMock()],
		});

		const user = await fillLoginForm(VALID_LOGIN);
		await user.click(screen.getByRole('button', { name: 'Entrar' }));

		await waitFor(() => {
			expect(mockToastError).toHaveBeenCalledWith('Erro ao fazer login');
		});

		expect(mockNavigate).not.toHaveBeenCalled();
		expect(mockToastSuccess).not.toHaveBeenCalled();
	});
});
