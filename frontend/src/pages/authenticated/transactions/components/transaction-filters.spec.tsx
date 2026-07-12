import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	DEFAULT_TRANSACTION_FILTERS,
	shouldClearSelectedPeriod,
} from '../transaction-filters.state';
import { TransactionFilters } from './transaction-filters';

const CATEGORIES = [
	{ id: 'category-1', name: 'Alimentação' },
	{ id: 'category-2', name: 'Transporte' },
];

const PERIODS = [
	{ year: 2025, month: 11 },
	{ year: 2025, month: 10 },
];

describe('TransactionFilters', () => {
	describe('search debounce', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('applies search after debounce', async () => {
			const onChange = vi.fn();

			render(
				<TransactionFilters
					value={DEFAULT_TRANSACTION_FILTERS}
					onChange={onChange}
					categories={CATEGORIES}
					periods={PERIODS}
				/>,
			);

			fireEvent.change(screen.getByLabelText('Buscar'), { target: { value: 'jantar' } });
			expect(onChange).not.toHaveBeenCalled();

			await vi.advanceTimersByTimeAsync(300);

			expect(onChange).toHaveBeenCalledWith({
				...DEFAULT_TRANSACTION_FILTERS,
				search: 'jantar',
			});
		});

		it('applies search immediately when Enter is pressed', () => {
			const onChange = vi.fn();

			render(
				<TransactionFilters
					value={DEFAULT_TRANSACTION_FILTERS}
					onChange={onChange}
					categories={CATEGORIES}
					periods={PERIODS}
				/>,
			);

			const searchInput = screen.getByLabelText('Buscar');
			fireEvent.change(searchInput, { target: { value: 'jantar' } });
			fireEvent.keyDown(searchInput, { key: 'Enter' });

			expect(onChange).toHaveBeenCalledWith({
				...DEFAULT_TRANSACTION_FILTERS,
				search: 'jantar',
			});
		});
	});

	it('renders category and period options from props', () => {
		render(
			<TransactionFilters
				value={DEFAULT_TRANSACTION_FILTERS}
				onChange={vi.fn()}
				categories={CATEGORIES}
				periods={PERIODS}
			/>,
		);

		expect(screen.getByLabelText('Buscar')).toBeInTheDocument();
		expect(screen.getByLabelText('Tipo')).toBeInTheDocument();
		expect(screen.getByLabelText('Categoria')).toBeInTheDocument();
		expect(screen.getByLabelText('Período')).toBeInTheDocument();
	});

	it('maps type and category changes to controlled values', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();

		render(
			<TransactionFilters
				value={DEFAULT_TRANSACTION_FILTERS}
				onChange={onChange}
				categories={CATEGORIES}
				periods={PERIODS}
			/>,
		);

		await user.click(screen.getByLabelText('Tipo'));
		await user.click(screen.getByRole('option', { name: 'Entrada' }));

		expect(onChange).toHaveBeenCalledWith({
			...DEFAULT_TRANSACTION_FILTERS,
			type: 'INCOME',
		});

		await user.click(screen.getByLabelText('Categoria'));
		await user.click(screen.getByRole('option', { name: 'Transporte' }));

		expect(onChange).toHaveBeenLastCalledWith({
			...DEFAULT_TRANSACTION_FILTERS,
			categoryId: 'category-2',
		});
	});
});

describe('shouldClearSelectedPeriod', () => {
	it('returns false while periods are loading', () => {
		expect(shouldClearSelectedPeriod([{ year: 2025, month: 11 }], '2025-11', true)).toBe(false);
	});

	it('returns false when all periods is selected', () => {
		expect(shouldClearSelectedPeriod([], 'all', false)).toBe(false);
	});

	it('returns true when the selected period is no longer available', () => {
		expect(shouldClearSelectedPeriod([], '2025-11', false)).toBe(true);
	});
});
