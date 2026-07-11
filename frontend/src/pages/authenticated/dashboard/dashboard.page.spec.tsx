import type { MockLink } from '@apollo/client/testing';
import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GET_CATEGORIES } from '@/hooks/use-categories';
import { GET_TRANSACTIONS, type TransactionRow } from '@/hooks/use-transactions';
import { renderWithProviders } from '@/tests/helpers/render';
import { DashboardPage, GET_DASHBOARD_SUMMARY } from './dashboard.page';

const SUMMARY_MOCK = {
	totalBalance: 1000,
	monthlyIncome: 500,
	monthlyExpenses: 200,
};

const CATEGORY_WITH_STATS = {
	id: 'category-1',
	name: 'Alimentação',
	description: 'Restaurantes e delivery',
	icon: 'food',
	color: 'blue',
	transactionCount: 2,
	totalAmount: 80,
};

const SAMPLE_TRANSACTION: TransactionRow = {
	id: 'transaction-1',
	amount: 89.5,
	type: 'EXPENSE',
	description: 'Jantar no Restaurante',
	date: '2025-11-30T12:00:00.000Z',
	category: {
		id: 'category-1',
		name: 'Alimentação',
		icon: 'food',
		color: 'blue',
	},
};

function getDashboardSummaryMock(): MockLink.MockedResponse {
	return {
		request: { query: GET_DASHBOARD_SUMMARY },
		result: { data: { getDashboardSummary: SUMMARY_MOCK } },
	};
}

function getCategoriesMock(
	categories: (typeof CATEGORY_WITH_STATS)[],
	includeStats: boolean,
): MockLink.MockedResponse {
	return {
		request: {
			query: GET_CATEGORIES,
			variables: { includeStats },
		},
		result: { data: { getCategories: categories } },
	};
}

function getRecentTransactionsMock(
	items: TransactionRow[] = [SAMPLE_TRANSACTION],
): MockLink.MockedResponse {
	return {
		request: {
			query: GET_TRANSACTIONS,
			variables: { page: 1, pageSize: 5 },
		},
		result: {
			data: {
				getTransactions: {
					items,
					totalCount: items.length,
					page: 1,
					pageSize: 5,
				},
			},
		},
	};
}

function renderDashboard(mocks: MockLink.MockedResponse[] = []) {
	return renderWithProviders(<DashboardPage />, {
		mocks: [
			getDashboardSummaryMock(),
			getCategoriesMock([CATEGORY_WITH_STATS], true),
			getRecentTransactionsMock(),
			...mocks,
		],
	});
}

describe('DashboardPage', () => {
	it('renders summary cards with formatted values', async () => {
		renderDashboard();

		const summaryCards = await screen.findByTestId('dashboard-summary-cards');
		expect(within(summaryCards).getByText('R$ 1.000,00')).toBeInTheDocument();
		expect(within(summaryCards).getByText('R$ 500,00')).toBeInTheDocument();
		expect(within(summaryCards).getByText('R$ 200,00')).toBeInTheDocument();
	});

	it('renders recent transactions', async () => {
		renderDashboard();

		expect(await screen.findByTestId('recent-transaction-row-transaction-1')).toBeInTheDocument();
		expect(screen.getByText('Jantar no Restaurante')).toBeInTheDocument();
		expect(screen.getByText('- R$ 89,50')).toBeInTheDocument();
	});

	it('renders category spending summary as a three-column table row', async () => {
		renderDashboard();

		const panel = await screen.findByTestId('category-summary-panel');
		expect(within(panel).getByRole('columnheader', { name: 'Categorias' })).toBeInTheDocument();

		const row = await within(panel).findByTestId('category-summary-row-category-1');
		const cells = within(row).getAllByRole('cell');
		expect(cells).toHaveLength(3);
		expect(within(cells[0]).getByText('Alimentação')).toBeInTheDocument();
		expect(cells[1]).toHaveTextContent('2 itens');
		expect(cells[2]).toHaveTextContent('R$ 80,00');
	});

	it('links to transactions and categories pages', async () => {
		renderDashboard();

		expect(await screen.findByRole('link', { name: 'Ver todas' })).toHaveAttribute(
			'href',
			'/transactions',
		);
		expect(screen.getByRole('link', { name: 'Gerenciar' })).toHaveAttribute('href', '/categories');
	});
});
