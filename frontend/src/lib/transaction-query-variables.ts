import type { ListTransactionFiltersInputType } from '@financy/shared';

export type GetTransactionsVariables = {
	page: number;
	pageSize: number;
	filters?: ListTransactionFiltersInputType;
};

export function hasActiveTransactionFilters(
	filters?: ListTransactionFiltersInputType,
): filters is ListTransactionFiltersInputType {
	if (!filters) {
		return false;
	}

	return Object.keys(filters).length > 0;
}

export function buildGetTransactionsVariables(
	page: number,
	pageSize: number,
	filters?: ListTransactionFiltersInputType,
): GetTransactionsVariables {
	if (!hasActiveTransactionFilters(filters)) {
		return { page, pageSize };
	}

	return { page, pageSize, filters };
}
