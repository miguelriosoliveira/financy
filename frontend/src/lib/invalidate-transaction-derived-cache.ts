import type { ApolloCache } from '@apollo/client';

export function invalidateTransactionDerivedDashboardCache(cache: ApolloCache) {
	cache.evict({ fieldName: 'getDashboardSummary' });
	cache.evict({
		fieldName: 'getCategories',
		args: { includeStats: true },
	});
	cache.evict({ fieldName: 'getTransactions' });
	cache.gc();
}
