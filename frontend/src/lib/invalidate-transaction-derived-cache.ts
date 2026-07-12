import type { ApolloCache } from '@apollo/client';

export function invalidateTransactionDerivedCache(cache: ApolloCache) {
	cache.evict({ fieldName: 'getDashboardSummary' });
	cache.evict({ fieldName: 'getTransactions' });
	cache.evict({ fieldName: 'getCategoriesSummary' });
	cache.evict({ fieldName: 'getCategories', args: { includeStats: true } });
	cache.gc();
}
