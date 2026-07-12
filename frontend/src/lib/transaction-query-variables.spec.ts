import { describe, expect, it } from 'vitest';
import { buildGetTransactionsVariables } from './transaction-query-variables';

describe('buildGetTransactionsVariables', () => {
	it('omits filters when none are active', () => {
		expect(buildGetTransactionsVariables(1, 10)).toEqual({ page: 1, pageSize: 10 });
		expect(buildGetTransactionsVariables(2, 10, undefined)).toEqual({ page: 2, pageSize: 10 });
	});

	it('includes filters when at least one field is active', () => {
		expect(
			buildGetTransactionsVariables(1, 10, {
				search: 'jantar',
				type: 'EXPENSE',
			}),
		).toEqual({
			page: 1,
			pageSize: 10,
			filters: {
				search: 'jantar',
				type: 'EXPENSE',
			},
		});
	});
});
