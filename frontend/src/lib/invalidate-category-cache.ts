import type { ApolloCache } from '@apollo/client';

export function invalidateCategoryCache(cache: ApolloCache) {
	cache.evict({ fieldName: 'getCategories' });
	cache.gc();
}
