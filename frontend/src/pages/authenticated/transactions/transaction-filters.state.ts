import type { ListTransactionFiltersInputType } from '@financy/shared';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { TransactionPeriod } from '@/hooks/use-transaction-periods';

export type TransactionFiltersState = {
	search: string;
	type: 'all' | 'INCOME' | 'EXPENSE';
	categoryId: 'all' | string;
	period: 'all' | string;
};

export const DEFAULT_TRANSACTION_FILTERS = {
	search: '',
	type: 'all',
	categoryId: 'all',
	period: 'all',
} satisfies TransactionFiltersState;

export function encodePeriodValue(year: number, month: number) {
	return `${year}-${month}`;
}

export function decodePeriodValue(value: string) {
	const [year, month] = value.split('-').map(Number);
	return { year, month };
}

export function formatPeriodLabel(year: number, month: number) {
	const label = format(new Date(Date.UTC(year, month - 1, 1)), 'MMMM / yyyy', {
		locale: ptBR,
	});
	return label.charAt(0).toUpperCase() + label.slice(1);
}

export function toGraphqlFilters(
	state: TransactionFiltersState,
): ListTransactionFiltersInputType | undefined {
	const filters: ListTransactionFiltersInputType = {};

	if (state.search.trim()) {
		filters.search = state.search.trim();
	}

	if (state.type !== 'all') {
		filters.type = state.type;
	}

	if (state.categoryId !== 'all') {
		filters.categoryId = state.categoryId;
	}

	if (state.period !== 'all') {
		filters.period = decodePeriodValue(state.period);
	}

	return Object.keys(filters).length > 0 ? filters : undefined;
}

export function hasActiveTransactionFilterState(state: TransactionFiltersState) {
	return toGraphqlFilters(state) !== undefined;
}

export function shouldClearSelectedPeriod(
	periods: TransactionPeriod[],
	selectedPeriod: string,
	periodsLoading: boolean,
) {
	if (selectedPeriod === 'all' || periodsLoading) {
		return false;
	}

	return !periods.some(period => encodePeriodValue(period.year, period.month) === selectedPeriod);
}
