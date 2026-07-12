import { InMemoryCache } from '@apollo/client';
import { describe, expect, it } from 'vitest';
import { GET_CATEGORIES } from '@/hooks/use-categories';
import { DEFAULT_TRANSACTION_PAGE_SIZE, GET_TRANSACTIONS } from '@/hooks/use-transactions';
import { GET_CATEGORIES_SUMMARY } from '@/pages/authenticated/categories/categories.queries';
import { GET_DASHBOARD_SUMMARY } from '@/pages/authenticated/dashboard/dashboard.queries';
import { invalidateTransactionDerivedCache } from './invalidate-transaction-derived-cache';

const RECENT_TRANSACTIONS_PAGE_SIZE = 5;

function createSeededCache() {
	const cache = new InMemoryCache();

	cache.writeQuery({
		query: GET_DASHBOARD_SUMMARY,
		data: {
			getDashboardSummary: {
				totalBalance: 1000,
				monthlyIncome: 500,
				monthlyExpenses: 200,
			},
		},
	});

	cache.writeQuery({
		query: GET_CATEGORIES_SUMMARY,
		data: {
			getCategoriesSummary: {
				transactionCount: 5,
				mostUsedCategory: {
					id: 'category-1',
					name: 'Alimentação',
					transactionCount: 3,
				},
			},
		},
	});

	cache.writeQuery({
		query: GET_CATEGORIES,
		variables: { includeStats: true },
		data: {
			getCategories: [
				{
					id: 'category-1',
					name: 'Alimentação',
					description: null,
					icon: 'food',
					color: 'blue',
					transactionCount: 2,
					totalAmount: 80,
				},
			],
		},
	});

	cache.writeQuery({
		query: GET_TRANSACTIONS,
		variables: { page: 1, pageSize: RECENT_TRANSACTIONS_PAGE_SIZE },
		data: {
			getTransactions: {
				items: [],
				totalCount: 0,
				page: 1,
				pageSize: RECENT_TRANSACTIONS_PAGE_SIZE,
			},
		},
	});

	cache.writeQuery({
		query: GET_TRANSACTIONS,
		variables: { page: 1, pageSize: DEFAULT_TRANSACTION_PAGE_SIZE },
		data: {
			getTransactions: {
				items: [],
				totalCount: 0,
				page: 1,
				pageSize: DEFAULT_TRANSACTION_PAGE_SIZE,
			},
		},
	});

	cache.writeQuery({
		query: GET_CATEGORIES,
		variables: { includeStats: false },
		data: {
			getCategories: [
				{
					id: 'category-1',
					name: 'Alimentação',
					description: null,
					icon: 'food',
					color: 'blue',
				},
			],
		},
	});

	return cache;
}

describe('invalidateTransactionDerivedCache', () => {
	it('evicts dashboard summary, categories summary, stats categories, and all transaction list caches', () => {
		const cache = createSeededCache();

		invalidateTransactionDerivedCache(cache);

		expect(cache.readQuery({ query: GET_DASHBOARD_SUMMARY })).toBeNull();
		expect(cache.readQuery({ query: GET_CATEGORIES_SUMMARY })).toBeNull();
		expect(
			cache.readQuery({
				query: GET_CATEGORIES,
				variables: { includeStats: true },
			}),
		).toBeNull();
		expect(
			cache.readQuery({
				query: GET_TRANSACTIONS,
				variables: { page: 1, pageSize: RECENT_TRANSACTIONS_PAGE_SIZE },
			}),
		).toBeNull();
		expect(
			cache.readQuery({
				query: GET_TRANSACTIONS,
				variables: { page: 1, pageSize: DEFAULT_TRANSACTION_PAGE_SIZE },
			}),
		).toBeNull();
	});

	it('keeps non-stats category queries in the cache', () => {
		const cache = createSeededCache();

		invalidateTransactionDerivedCache(cache);

		expect(
			cache.readQuery({
				query: GET_CATEGORIES,
				variables: { includeStats: false },
			}),
		).not.toBeNull();
	});
});
