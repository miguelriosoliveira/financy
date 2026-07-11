import { MockedProvider } from '@apollo/client/testing/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { GET_CATEGORIES } from '@/hooks/use-categories';
import { GET_ME } from '@/hooks/use-current-user';
import { GET_TRANSACTIONS } from '@/hooks/use-transactions';
import { clearTokens, setTokens } from '@/lib/auth';
import { GET_DASHBOARD_SUMMARY } from '@/pages/authenticated/dashboard/dashboard.page';
import { AppRoutes } from './router';

const mocks = [
	{
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
	},
	{
		request: { query: GET_DASHBOARD_SUMMARY },
		result: {
			data: {
				getDashboardSummary: {
					totalBalance: 1000,
					monthlyIncome: 500,
					monthlyExpenses: 200,
				},
			},
		},
	},
	{
		request: { query: GET_CATEGORIES, variables: { includeStats: true } },
		result: { data: { getCategories: [] } },
	},
	{
		request: { query: GET_TRANSACTIONS, variables: { page: 1, pageSize: 5 } },
		result: {
			data: {
				getTransactions: {
					items: [],
					totalCount: 0,
					page: 1,
					pageSize: 5,
				},
			},
		},
	},
];

function renderAt(path: string) {
	return render(
		<MockedProvider mocks={mocks}>
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

	it('renders dashboard for authenticated users', async () => {
		setTokens('access-token', 'refresh-token', true);
		renderAt('/');
		expect(await screen.findByTestId('dashboard-page')).toBeInTheDocument();
	});

	it('redirects authenticated users from unknown routes to dashboard', async () => {
		setTokens('access-token', 'refresh-token', true);
		renderAt('/unknown');
		expect(await screen.findByTestId('dashboard-page')).toBeInTheDocument();
	});

	it('renders profile page for authenticated users', async () => {
		setTokens('access-token', 'refresh-token', true);
		renderAt('/profile');
		expect(await screen.findByText('Salvar alterações')).toBeInTheDocument();
		expect(screen.getByText('Sair da conta')).toBeInTheDocument();
	});
});
