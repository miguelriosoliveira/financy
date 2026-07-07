import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { GET_ME } from '@/hooks/use-current-user';
import { clearTokens, setTokens } from '@/lib/auth';
import { ProfilePage } from '@/pages/authenticated/profile/profile.page';
import { renderWithProviders } from '@/tests/helpers/render';

const navigateMock = vi.fn();

vi.mock('react-router', async importOriginal => {
	const actual = await importOriginal<typeof import('react-router')>();
	return {
		...actual,
		useNavigate: () => navigateMock,
	};
});

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

describe('ProfilePage', () => {
	it('renders user profile data', async () => {
		renderWithProviders(<ProfilePage />, { mocks: [meMock] });

		expect(await screen.findByText('Conta teste')).toBeInTheDocument();
		expect(screen.getByText('conta@teste.com')).toBeInTheDocument();
		expect(screen.getByText('CT')).toBeInTheDocument();
		expect(screen.getByText('O e-mail não pode ser alterado')).toBeInTheDocument();
	});

	it('logs out when clicking Sair da conta', async () => {
		setTokens('access-token', 'refresh-token', true);
		const user = userEvent.setup();

		renderWithProviders(<ProfilePage />, { mocks: [meMock] });
		await screen.findByText('Conta teste');

		await user.click(screen.getByRole('button', { name: 'Sair da conta' }));

		expect(navigateMock).toHaveBeenCalledWith('/login');
		clearTokens();
	});
});
