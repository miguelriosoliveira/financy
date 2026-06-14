import { gql } from '@apollo/client';
import type { MockLink } from '@apollo/client/testing';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/tests/helpers/render';
import { RegisterPage } from './register.page';

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

const REGISTER = gql`
	mutation Register($data: RegisterInput!) {
		register(data: $data) {
			token
			refreshToken
		}
	}
`;

const VALID_REGISTRATION = {
	name: 'Ada Lovelace',
	email: 'ada@example.com',
	password: 'secret123',
};

const REGISTER_FIELD_MESSAGES = {
	name: 'Informe seu nome completo',
	email: 'Informe um e-mail válido',
	password: 'A senha deve ter no mínimo 8 caracteres',
} as const;

function createRegisterSuccessMock(data = VALID_REGISTRATION): MockLink.MockedResponse {
	return {
		request: {
			query: REGISTER,
			variables: { data },
		},
		result: {
			data: {
				register: {
					token: 'access-token',
					refreshToken: 'refresh-token',
				},
			},
		},
	};
}

function createRegisterErrorMock(data = VALID_REGISTRATION): MockLink.MockedResponse {
	return {
		request: {
			query: REGISTER,
			variables: { data },
		},
		error: new Error('User already registered'),
	};
}

async function fillRegistrationForm(data: { name: string; email: string; password: string }) {
	const user = userEvent.setup();

	if (data.name) {
		await user.type(screen.getByLabelText('Nome completo'), data.name);
	}
	if (data.email) {
		await user.type(screen.getByLabelText('E-mail'), data.email);
	}
	if (data.password) {
		await user.type(screen.getByLabelText('Senha'), data.password);
	}

	return user;
}

describe('RegisterPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders the registration form fields and submit button', () => {
		renderWithProviders(<RegisterPage />);

		expect(screen.getByLabelText('Nome completo')).toBeInTheDocument();
		expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
		expect(screen.getByLabelText('Senha')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeInTheDocument();
	});

	it('toggles password visibility', async () => {
		renderWithProviders(<RegisterPage />);

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
			label: 'empty name',
			data: { name: '', email: 'ada@example.com', password: 'secret123' },
			field: 'name' as const,
			message: REGISTER_FIELD_MESSAGES.name,
		},
		{
			label: 'invalid email',
			data: { name: 'Ada Lovelace', email: 'not-an-email', password: 'secret123' },
			field: 'email' as const,
			message: REGISTER_FIELD_MESSAGES.email,
		},
		{
			label: 'short password',
			data: { name: 'Ada Lovelace', email: 'ada@example.com', password: 'short' },
			field: 'password' as const,
			message: REGISTER_FIELD_MESSAGES.password,
		},
	])('rejects registration with $label', async ({ data, field, message }) => {
		renderWithProviders(<RegisterPage />, {
			mocks: [createRegisterSuccessMock()],
		});

		const user = await fillRegistrationForm(data);
		await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

		expect(await screen.findByText(message)).toBeInTheDocument();

		if (field === 'name') {
			expect(screen.queryByText(REGISTER_FIELD_MESSAGES.email)).not.toBeInTheDocument();
			expect(screen.queryByText(REGISTER_FIELD_MESSAGES.password)).not.toBeInTheDocument();
		}

		if (field === 'email') {
			expect(screen.queryByText(REGISTER_FIELD_MESSAGES.name)).not.toBeInTheDocument();
			expect(screen.queryByText(REGISTER_FIELD_MESSAGES.password)).not.toBeInTheDocument();
		}

		if (field === 'password') {
			expect(screen.queryByText(REGISTER_FIELD_MESSAGES.name)).not.toBeInTheDocument();
			expect(screen.queryByText(REGISTER_FIELD_MESSAGES.email)).not.toBeInTheDocument();
		}

		expect(mockNavigate).not.toHaveBeenCalled();
		expect(mockToastSuccess).not.toHaveBeenCalled();
		expect(mockToastError).not.toHaveBeenCalled();
	});

	it('registers a new user and redirects to login', async () => {
		renderWithProviders(<RegisterPage />, {
			mocks: [
				createRegisterSuccessMock({
					name: 'Ada Lovelace',
					email: 'ada@example.com',
					password: 'secret123',
				}),
			],
		});

		const user = await fillRegistrationForm({
			name: '  Ada Lovelace  ',
			email: 'ADA@Example.COM ',
			password: 'secret123',
		});

		await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

		await waitFor(() => {
			expect(mockToastSuccess).toHaveBeenCalledWith('Usuário cadastrado com sucesso');
		});

		expect(mockNavigate).toHaveBeenCalledWith('/login');
		expect(mockToastError).not.toHaveBeenCalled();
	});

	it('shows an error toast when registration fails', async () => {
		renderWithProviders(<RegisterPage />, {
			mocks: [createRegisterErrorMock()],
		});

		const user = await fillRegistrationForm(VALID_REGISTRATION);
		await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

		await waitFor(() => {
			expect(mockToastError).toHaveBeenCalledWith('Erro ao cadastrar usuário');
		});

		expect(mockNavigate).not.toHaveBeenCalled();
		expect(mockToastSuccess).not.toHaveBeenCalled();
	});
});
