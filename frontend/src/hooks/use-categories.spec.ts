import { InMemoryCache } from '@apollo/client';
import { describe, expect, it } from 'vitest';
import { GET_CATEGORIES, type GetCategoriesResult } from './use-categories';

const CATEGORY_BASE = {
	__typename: 'CategoryModel' as const,
	id: 'category-1',
	name: 'Alimentação',
	description: null,
	icon: 'food',
	color: 'blue',
};

describe('GET_CATEGORIES cache behavior', () => {
	it('preserves stats when a non-stats response arrives after a stats response', () => {
		const cache = new InMemoryCache();

		cache.writeQuery({
			query: GET_CATEGORIES,
			variables: { includeStats: true },
			data: {
				getCategories: [
					{
						...CATEGORY_BASE,
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
				getCategories: [CATEGORY_BASE],
			},
		});

		const statsResult = cache.readQuery<GetCategoriesResult>({
			query: GET_CATEGORIES,
			variables: { includeStats: true },
		});

		expect(statsResult?.getCategories[0].transactionCount).toBe(2);
		expect(statsResult?.getCategories[0].totalAmount).toBe(80);
	});
});
