import { InMemoryCache } from '@apollo/client';
import { describe, expect, it } from 'vitest';
import { GET_CATEGORIES } from '@/hooks/use-categories';
import { invalidateCategoryCache } from './invalidate-category-cache';

function createSeededCache() {
	const cache = new InMemoryCache();

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

describe('invalidateCategoryCache', () => {
	it('evicts every cached category list regardless of includeStats', () => {
		const cache = createSeededCache();

		invalidateCategoryCache(cache);

		expect(
			cache.readQuery({
				query: GET_CATEGORIES,
				variables: { includeStats: true },
			}),
		).toBeNull();
		expect(
			cache.readQuery({
				query: GET_CATEGORIES,
				variables: { includeStats: false },
			}),
		).toBeNull();
	});
});
