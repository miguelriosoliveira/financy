import type { MockLink } from '@apollo/client/testing';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET_CATEGORIES } from '@/hooks/use-categories';
import { GET_TRANSACTION_PERIODS } from '@/hooks/use-transaction-periods';
import {
	CREATE_TRANSACTION,
	DEFAULT_TRANSACTION_PAGE_SIZE,
	GET_TRANSACTIONS,
	type TransactionRow,
} from '@/hooks/use-transactions';
import { invalidateTransactionDerivedCache } from '@/lib/invalidate-transaction-derived-cache';
import { renderWithProviders } from '@/tests/helpers/render';
import { DELETE_TRANSACTION, EDIT_TRANSACTION, TransactionsPage } from './transactions.page';

vi.mock('@/lib/invalidate-transaction-derived-cache', async importOriginal => {
	const actual =
		await importOriginal<typeof import('@/lib/invalidate-transaction-derived-cache')>();
	return {
		...actual,
		invalidateTransactionDerivedCache: vi.fn(actual.invalidateTransactionDerivedCache),
	};
});

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock('react-toastify', () => ({
	toast: {
		success: (...args: unknown[]) => mockToastSuccess(...args),
		error: (...args: unknown[]) => mockToastError(...args),
	},
}));

const VALID_TRANSACTION = {
	amount: 89.5,
	type: 'EXPENSE' as const,
	description: 'Jantar no Restaurante',
	date: new Date('2025-11-30T12:00:00.000Z'),
	categoryId: 'category-1',
};

const UPDATED_TRANSACTION = {
	amount: 120,
	type: 'INCOME' as const,
	description: 'Transação atualizada',
	date: new Date('2025-12-01T12:00:00.000Z'),
	categoryId: 'category-1',
};

vi.mock('./components/transaction-form-dialog', () => ({
	TransactionFormDialog: ({
		mode,
		onSubmit,
		open,
		onOpenChange,
	}: {
		mode: 'create' | 'edit';
		onSubmit: (data: typeof VALID_TRANSACTION | typeof UPDATED_TRANSACTION) => void;
		open: boolean;
		onOpenChange: (open: boolean) => void;
	}) => {
		if (mode === 'create') {
			return (
				<div>
					<button type="button" onClick={() => onOpenChange(true)}>
						Nova transação
					</button>
					{open ? (
						<div role="dialog" aria-label="Nova transação">
							<button type="button" onClick={() => onSubmit(VALID_TRANSACTION)}>
								Salvar
							</button>
						</div>
					) : null}
				</div>
			);
		}

		return open ? (
			<div role="dialog" aria-label="Editar transação">
				<button type="button" onClick={() => onSubmit(UPDATED_TRANSACTION)}>
					Salvar
				</button>
			</div>
		) : null;
	},
}));

const EXISTING_CATEGORY = {
	id: 'category-1',
	name: 'Alimentação',
	description: 'Restaurantes e delivery',
	icon: 'food',
	color: 'blue',
};

const SAMPLE_TRANSACTION: TransactionRow = {
	id: 'transaction-1',
	amount: 89.5,
	type: 'EXPENSE',
	description: 'Jantar no Restaurante',
	date: '2025-11-30T12:00:00.000Z',
	category: {
		id: 'category-1',
		name: 'Alimentação',
		icon: 'food',
		color: 'blue',
	},
};

const PAGE_TWO_TRANSACTION: TransactionRow = {
	id: 'transaction-11',
	amount: 120,
	type: 'EXPENSE',
	description: 'Transação página 2',
	date: '2025-11-20T12:00:00.000Z',
	category: {
		id: 'category-1',
		name: 'Alimentação',
		icon: 'food',
		color: 'blue',
	},
};

const CATEGORY_NOT_FOUND_MESSAGE = 'Categoria não encontrada';
const TRANSACTION_NOT_FOUND_MESSAGE = 'Transação não encontrada';

const MUTATION_VARIABLES = {
	data: {
		amount: VALID_TRANSACTION.amount,
		type: VALID_TRANSACTION.type,
		description: VALID_TRANSACTION.description,
		date: VALID_TRANSACTION.date.toISOString(),
		categoryId: VALID_TRANSACTION.categoryId,
	},
};

const EDIT_MUTATION_VARIABLES = {
	id: SAMPLE_TRANSACTION.id,
	data: {
		amount: UPDATED_TRANSACTION.amount,
		type: UPDATED_TRANSACTION.type,
		description: UPDATED_TRANSACTION.description,
		date: UPDATED_TRANSACTION.date.toISOString(),
		categoryId: UPDATED_TRANSACTION.categoryId,
	},
};

function buildPageMocks(
	mocks: MockLink.MockedResponse[],
	categories: (typeof EXISTING_CATEGORY)[] = [EXISTING_CATEGORY],
	periods: Array<{ year: number; month: number }> = [{ year: 2025, month: 11 }],
) {
	return [getCategoriesMock(categories), getTransactionPeriodsMock(periods), ...mocks];
}

function getTransactionPeriodsMock(
	periods: Array<{ year: number; month: number }> = [{ year: 2025, month: 11 }],
): MockLink.MockedResponse {
	return {
		request: { query: GET_TRANSACTION_PERIODS },
		result: { data: { getTransactionPeriods: periods } },
	};
}

function getCategoriesMock(categories: (typeof EXISTING_CATEGORY)[] = []): MockLink.MockedResponse {
	return {
		request: { query: GET_CATEGORIES, variables: { includeStats: false } },
		result: {
			data: {
				getCategories: categories.map(category => ({
					...category,
					transactionCount: null,
					totalAmount: null,
				})),
			},
		},
	};
}

function getTransactionsMock({
	page = 1,
	pageSize = DEFAULT_TRANSACTION_PAGE_SIZE,
	filters,
	items = [SAMPLE_TRANSACTION],
	totalCount = items.length,
}: {
	page?: number;
	pageSize?: number;
	filters?: {
		search?: string;
		type?: 'INCOME' | 'EXPENSE';
		categoryId?: string;
		period?: { year: number; month: number };
	};
	items?: TransactionRow[];
	totalCount?: number;
} = {}): MockLink.MockedResponse {
	const variables = filters ? { page, pageSize, filters } : { page, pageSize };

	return {
		request: {
			query: GET_TRANSACTIONS,
			variables,
		},
		result: {
			data: {
				getTransactions: {
					items,
					totalCount,
					page,
					pageSize,
				},
			},
		},
	};
}

function createPaginatedTransactions(pageSize: number, totalCount: number, page: number) {
	const startIndex = (page - 1) * pageSize;
	const remaining = totalCount - startIndex;
	const count = Math.min(pageSize, Math.max(remaining, 0));

	return Array.from({ length: count }, (_, index) => ({
		...SAMPLE_TRANSACTION,
		id: `transaction-${startIndex + index + 1}`,
		description: `Transação ${startIndex + index + 1}`,
	}));
}

function createTransactionSuccessMock(): MockLink.MockedResponse {
	return {
		request: {
			query: CREATE_TRANSACTION,
			variables: MUTATION_VARIABLES,
		},
		result: {
			data: {
				createTransaction: {
					id: 'transaction-created',
					...MUTATION_VARIABLES.data,
					userId: 'test-user-id',
				},
			},
		},
	};
}

function createTransactionCategoryNotFoundMock(): MockLink.MockedResponse {
	return {
		request: {
			query: CREATE_TRANSACTION,
			variables: MUTATION_VARIABLES,
		},
		result: {
			errors: [
				{
					message: 'Category not found',
					extensions: { code: 'CATEGORY_NOT_FOUND' },
				},
			],
		},
	};
}

function createTransactionUnexpectedErrorMock(): MockLink.MockedResponse {
	return {
		request: {
			query: CREATE_TRANSACTION,
			variables: MUTATION_VARIABLES,
		},
		error: new Error('Network error'),
	};
}

function editTransactionSuccessMock(): MockLink.MockedResponse {
	return {
		request: {
			query: EDIT_TRANSACTION,
			variables: EDIT_MUTATION_VARIABLES,
		},
		result: {
			data: {
				editTransaction: {
					id: SAMPLE_TRANSACTION.id,
					...EDIT_MUTATION_VARIABLES.data,
					userId: 'test-user-id',
				},
			},
		},
	};
}

function editTransactionNotFoundMock(): MockLink.MockedResponse {
	return {
		request: {
			query: EDIT_TRANSACTION,
			variables: EDIT_MUTATION_VARIABLES,
		},
		result: {
			errors: [
				{
					message: 'Transaction not found',
					extensions: { code: 'TRANSACTION_NOT_FOUND' },
				},
			],
		},
	};
}

function editTransactionUnexpectedErrorMock(): MockLink.MockedResponse {
	return {
		request: {
			query: EDIT_TRANSACTION,
			variables: EDIT_MUTATION_VARIABLES,
		},
		error: new Error('Network error'),
	};
}

function deleteTransactionSuccessMock(id = SAMPLE_TRANSACTION.id): MockLink.MockedResponse {
	return {
		request: {
			query: DELETE_TRANSACTION,
			variables: { id },
		},
		result: {
			data: {
				deleteTransaction: { id },
			},
		},
	};
}

function deleteTransactionUnexpectedErrorMock(id = SAMPLE_TRANSACTION.id): MockLink.MockedResponse {
	return {
		request: {
			query: DELETE_TRANSACTION,
			variables: { id },
		},
		error: new Error('Network error'),
	};
}

async function openDeleteTransactionDialog() {
	const user = userEvent.setup();

	await waitFor(() => {
		expect(screen.getByTestId('transaction-row-transaction-1')).toBeInTheDocument();
	});

	await user.click(screen.getByRole('button', { name: 'Excluir transação' }));

	await waitFor(() => {
		expect(screen.getByRole('dialog', { name: 'Excluir transação' })).toBeInTheDocument();
	});

	return user;
}

describe('TransactionsPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders the create trigger and opens the dialog', async () => {
		renderWithProviders(<TransactionsPage />, {
			mocks: buildPageMocks([getTransactionsMock({ items: [], totalCount: 0 })]),
		});

		expect(screen.getByRole('button', { name: 'Nova transação' })).toBeInTheDocument();

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: 'Nova transação' }));

		expect(screen.getByRole('dialog', { name: 'Nova transação' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
	});

	it('shows loading then empty state when there are no transactions', async () => {
		renderWithProviders(<TransactionsPage />, {
			mocks: buildPageMocks([getTransactionsMock({ items: [], totalCount: 0 })]),
		});

		expect(screen.getByText('Carregando transações...')).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByText('Nenhuma transação ainda')).toBeInTheDocument();
		});
	});

	it('renders transactions from the query with formatted values', async () => {
		renderWithProviders(<TransactionsPage />, {
			mocks: buildPageMocks([getTransactionsMock({ items: [SAMPLE_TRANSACTION], totalCount: 1 })]),
		});

		await waitFor(() => {
			expect(screen.getByTestId('transaction-row-transaction-1')).toBeInTheDocument();
		});

		expect(screen.getByText('Jantar no Restaurante')).toBeInTheDocument();
		expect(screen.getByText('Alimentação')).toBeInTheDocument();
		expect(screen.getByText('30/11/25')).toBeInTheDocument();
		expect(screen.getByText('- R$ 89,50')).toBeInTheDocument();
	});

	it('shows the pagination summary and page buttons from totalCount', async () => {
		renderWithProviders(<TransactionsPage />, {
			mocks: buildPageMocks([
				getTransactionsMock({
					items: createPaginatedTransactions(DEFAULT_TRANSACTION_PAGE_SIZE, 27, 1),
					totalCount: 27,
				}),
			]),
		});

		await waitFor(() => {
			expect(screen.getByTestId('transaction-pagination-summary')).toHaveTextContent(
				'1 a 10 | 27 resultados',
			);
		});

		expect(screen.getByRole('button', { name: 'Página 1' })).toHaveAttribute(
			'aria-current',
			'page',
		);
		expect(screen.getByRole('button', { name: 'Página 2' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Página 3' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
		expect(screen.getByRole('button', { name: 'Próxima página' })).toBeEnabled();
	});

	it('loads the next page when a page button is clicked', async () => {
		renderWithProviders(<TransactionsPage />, {
			mocks: buildPageMocks([
				getTransactionsMock({
					items: createPaginatedTransactions(DEFAULT_TRANSACTION_PAGE_SIZE, 27, 1),
					totalCount: 27,
				}),
				getTransactionsMock({
					page: 2,
					items: [PAGE_TWO_TRANSACTION],
					totalCount: 27,
				}),
			]),
		});

		await waitFor(() => {
			expect(screen.getByText('Transação 1')).toBeInTheDocument();
		});

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: 'Página 2' }));

		await waitFor(() => {
			expect(screen.getByText('Transação página 2')).toBeInTheDocument();
		});

		expect(screen.getByTestId('transaction-pagination-summary')).toHaveTextContent(
			'11 a 20 | 27 resultados',
		);
		expect(screen.getByRole('button', { name: 'Página anterior' })).toBeEnabled();
	});

	it('creates a transaction successfully and refetches the list', async () => {
		renderWithProviders(<TransactionsPage />, {
			mocks: buildPageMocks([
				getTransactionsMock({ items: [], totalCount: 0 }),
				createTransactionSuccessMock(),
				getTransactionsMock({ items: [SAMPLE_TRANSACTION], totalCount: 1 }),
				getTransactionPeriodsMock(),
			]),
		});

		await waitFor(() => {
			expect(screen.getByText('Nenhuma transação ainda')).toBeInTheDocument();
		});

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: 'Nova transação' }));
		await user.click(screen.getByRole('button', { name: 'Salvar' }));

		await waitFor(() => {
			expect(mockToastSuccess).toHaveBeenCalledWith('Transação criada com sucesso');
		});

		await waitFor(() => {
			expect(screen.getByText('Jantar no Restaurante')).toBeInTheDocument();
		});

		expect(mockToastError).not.toHaveBeenCalled();
	});

	it('shows a field error and toast when the category is not found', async () => {
		renderWithProviders(<TransactionsPage />, {
			mocks: buildPageMocks([
				getTransactionsMock({ items: [], totalCount: 0 }),
				createTransactionCategoryNotFoundMock(),
			]),
		});

		await waitFor(() => {
			expect(screen.getByText('Nenhuma transação ainda')).toBeInTheDocument();
		});

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: 'Nova transação' }));
		await user.click(screen.getByRole('button', { name: 'Salvar' }));

		await waitFor(() => {
			expect(mockToastError).toHaveBeenCalledWith(CATEGORY_NOT_FOUND_MESSAGE);
		});

		expect(mockToastSuccess).not.toHaveBeenCalled();
	});

	it('shows a generic error toast when transaction creation fails unexpectedly', async () => {
		renderWithProviders(<TransactionsPage />, {
			mocks: buildPageMocks([
				getTransactionsMock({ items: [], totalCount: 0 }),
				createTransactionUnexpectedErrorMock(),
			]),
		});

		await waitFor(() => {
			expect(screen.getByText('Nenhuma transação ainda')).toBeInTheDocument();
		});

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: 'Nova transação' }));
		await user.click(screen.getByRole('button', { name: 'Salvar' }));

		await waitFor(() => {
			expect(mockToastError).toHaveBeenCalledWith('Erro ao criar transação');
		});

		expect(mockToastSuccess).not.toHaveBeenCalled();
	});

	it('opens the edit dialog when the edit button is clicked', async () => {
		renderWithProviders(<TransactionsPage />, {
			mocks: buildPageMocks([getTransactionsMock({ items: [SAMPLE_TRANSACTION], totalCount: 1 })]),
		});

		await waitFor(() => {
			expect(screen.getByTestId('transaction-row-transaction-1')).toBeInTheDocument();
		});

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: 'Editar transação' }));

		expect(screen.getByRole('dialog', { name: 'Editar transação' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
	});

	it('edits a transaction successfully and refetches the list', async () => {
		const updatedTransaction: TransactionRow = {
			...SAMPLE_TRANSACTION,
			amount: UPDATED_TRANSACTION.amount,
			type: UPDATED_TRANSACTION.type,
			description: UPDATED_TRANSACTION.description,
			date: UPDATED_TRANSACTION.date.toISOString(),
		};

		renderWithProviders(<TransactionsPage />, {
			mocks: buildPageMocks([
				getTransactionsMock({ items: [SAMPLE_TRANSACTION], totalCount: 1 }),
				editTransactionSuccessMock(),
				getTransactionsMock({ items: [updatedTransaction], totalCount: 1 }),
				getTransactionPeriodsMock(),
			]),
		});

		await waitFor(() => {
			expect(screen.getByText('Jantar no Restaurante')).toBeInTheDocument();
		});

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: 'Editar transação' }));
		await user.click(screen.getByRole('button', { name: 'Salvar' }));

		await waitFor(() => {
			expect(mockToastSuccess).toHaveBeenCalledWith('Transação editada com sucesso');
		});

		await waitFor(() => {
			expect(screen.getByText('Transação atualizada')).toBeInTheDocument();
		});

		expect(mockToastError).not.toHaveBeenCalled();
		expect(invalidateTransactionDerivedCache).toHaveBeenCalledTimes(1);
	});

	it('shows a field error and toast when the transaction is not found', async () => {
		renderWithProviders(<TransactionsPage />, {
			mocks: buildPageMocks([
				getTransactionsMock({ items: [SAMPLE_TRANSACTION], totalCount: 1 }),
				editTransactionNotFoundMock(),
			]),
		});

		await waitFor(() => {
			expect(screen.getByText('Jantar no Restaurante')).toBeInTheDocument();
		});

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: 'Editar transação' }));
		await user.click(screen.getByRole('button', { name: 'Salvar' }));

		await waitFor(() => {
			expect(mockToastError).toHaveBeenCalledWith(TRANSACTION_NOT_FOUND_MESSAGE);
		});

		expect(mockToastSuccess).not.toHaveBeenCalled();
	});

	it('shows a generic error toast when transaction edit fails unexpectedly', async () => {
		renderWithProviders(<TransactionsPage />, {
			mocks: buildPageMocks([
				getTransactionsMock({ items: [SAMPLE_TRANSACTION], totalCount: 1 }),
				editTransactionUnexpectedErrorMock(),
			]),
		});

		await waitFor(() => {
			expect(screen.getByText('Jantar no Restaurante')).toBeInTheDocument();
		});

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: 'Editar transação' }));
		await user.click(screen.getByRole('button', { name: 'Salvar' }));

		await waitFor(() => {
			expect(mockToastError).toHaveBeenCalledWith('Erro ao editar transação');
		});

		expect(mockToastSuccess).not.toHaveBeenCalled();
	});

	it('opens the delete confirmation dialog when clicking the trash button', async () => {
		renderWithProviders(<TransactionsPage />, {
			mocks: buildPageMocks([getTransactionsMock({ items: [SAMPLE_TRANSACTION], totalCount: 1 })]),
		});

		await openDeleteTransactionDialog();

		const dialog = screen.getByRole('dialog', { name: 'Excluir transação' });
		expect(dialog).toHaveTextContent('Jantar no Restaurante');
		expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument();
	});

	it('closes the delete dialog without calling the mutation when cancelled', async () => {
		renderWithProviders(<TransactionsPage />, {
			mocks: buildPageMocks([getTransactionsMock({ items: [SAMPLE_TRANSACTION], totalCount: 1 })]),
		});

		const user = await openDeleteTransactionDialog();
		await user.click(screen.getByRole('button', { name: 'Cancelar' }));

		await waitFor(() => {
			expect(screen.queryByRole('dialog', { name: 'Excluir transação' })).not.toBeInTheDocument();
		});

		expect(mockToastSuccess).not.toHaveBeenCalled();
		expect(screen.getByText('Jantar no Restaurante')).toBeInTheDocument();
	});

	it('deletes a transaction successfully and removes it from the list', async () => {
		renderWithProviders(<TransactionsPage />, {
			mocks: buildPageMocks([
				getTransactionsMock({ items: [SAMPLE_TRANSACTION], totalCount: 1 }),
				deleteTransactionSuccessMock(),
				getTransactionsMock({ items: [], totalCount: 0 }),
				getTransactionPeriodsMock(),
			]),
		});

		const user = await openDeleteTransactionDialog();
		const dialog = screen.getByRole('dialog', { name: 'Excluir transação' });
		await user.click(within(dialog).getByRole('button', { name: 'Excluir' }));

		await waitFor(() => {
			expect(mockToastSuccess).toHaveBeenCalledWith('Transação excluída com sucesso');
		});

		await waitFor(() => {
			expect(screen.getByText('Nenhuma transação ainda')).toBeInTheDocument();
		});

		expect(mockToastError).not.toHaveBeenCalled();
	});

	it('redirects to the previous page when deleting the last item on the current page', async () => {
		const pageTwoOnlyTransaction: TransactionRow = {
			id: 'transaction-11',
			amount: 50,
			type: 'EXPENSE',
			description: 'Última transação da página',
			date: '2025-11-20T12:00:00.000Z',
			category: SAMPLE_TRANSACTION.category,
		};

		renderWithProviders(<TransactionsPage />, {
			mocks: buildPageMocks([
				getTransactionsMock({
					items: createPaginatedTransactions(DEFAULT_TRANSACTION_PAGE_SIZE, 11, 1),
					totalCount: 11,
				}),
				getTransactionsMock({
					page: 2,
					items: [pageTwoOnlyTransaction],
					totalCount: 11,
				}),
				deleteTransactionSuccessMock(pageTwoOnlyTransaction.id),
				getTransactionsMock({
					page: 2,
					items: [],
					totalCount: 10,
				}),
				getTransactionPeriodsMock(),
				getTransactionsMock({
					items: createPaginatedTransactions(DEFAULT_TRANSACTION_PAGE_SIZE, 10, 1),
					totalCount: 10,
				}),
			]),
		});

		await waitFor(() => {
			expect(screen.getByText('Transação 1')).toBeInTheDocument();
		});

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: 'Página 2' }));

		await waitFor(() => {
			expect(screen.getByText('Última transação da página')).toBeInTheDocument();
		});

		await user.click(screen.getByRole('button', { name: 'Excluir transação' }));

		await waitFor(() => {
			expect(screen.getByRole('dialog', { name: 'Excluir transação' })).toBeInTheDocument();
		});

		const dialog = screen.getByRole('dialog', { name: 'Excluir transação' });
		await user.click(within(dialog).getByRole('button', { name: 'Excluir' }));

		await waitFor(() => {
			expect(mockToastSuccess).toHaveBeenCalledWith('Transação excluída com sucesso');
		});

		await waitFor(() => {
			expect(screen.getByText('Transação 1')).toBeInTheDocument();
		});

		expect(screen.queryByText('Nenhuma transação ainda')).not.toBeInTheDocument();
		expect(screen.getByTestId('transaction-pagination-summary')).toHaveTextContent(
			'1 a 10 | 10 resultados',
		);
		expect(screen.getByRole('button', { name: 'Página 1' })).toHaveAttribute(
			'aria-current',
			'page',
		);
	});

	it('shows a generic error toast when transaction delete fails unexpectedly', async () => {
		renderWithProviders(<TransactionsPage />, {
			mocks: buildPageMocks([
				getTransactionsMock({ items: [SAMPLE_TRANSACTION], totalCount: 1 }),
				deleteTransactionUnexpectedErrorMock(),
			]),
		});

		const user = await openDeleteTransactionDialog();
		const dialog = screen.getByRole('dialog', { name: 'Excluir transação' });
		await user.click(within(dialog).getByRole('button', { name: 'Excluir' }));

		await waitFor(() => {
			expect(mockToastError).toHaveBeenCalledWith('Erro ao excluir transação');
		});

		expect(mockToastSuccess).not.toHaveBeenCalled();
		expect(screen.getByText('Jantar no Restaurante')).toBeInTheDocument();
	});

	it('requests filtered transactions when a type filter is selected', async () => {
		renderWithProviders(<TransactionsPage />, {
			mocks: buildPageMocks([
				getTransactionsMock({ items: [SAMPLE_TRANSACTION], totalCount: 1 }),
				getTransactionsMock({
					filters: { type: 'EXPENSE' },
					items: [SAMPLE_TRANSACTION],
					totalCount: 1,
				}),
			]),
		});

		await waitFor(() => {
			expect(screen.getByText('Jantar no Restaurante')).toBeInTheDocument();
		});

		const user = userEvent.setup();
		await user.click(screen.getByLabelText('Tipo'));
		await user.click(screen.getByRole('option', { name: 'Saída' }));

		await waitFor(() => {
			expect(screen.getByText('Jantar no Restaurante')).toBeInTheDocument();
		});
	});

	it('resets pagination when filters change', async () => {
		renderWithProviders(<TransactionsPage />, {
			mocks: buildPageMocks([
				getTransactionsMock({
					items: createPaginatedTransactions(DEFAULT_TRANSACTION_PAGE_SIZE, 27, 1),
					totalCount: 27,
				}),
				getTransactionsMock({
					page: 2,
					items: [PAGE_TWO_TRANSACTION],
					totalCount: 27,
				}),
				getTransactionsMock({
					filters: { type: 'EXPENSE' },
					items: [SAMPLE_TRANSACTION],
					totalCount: 1,
				}),
			]),
		});

		await waitFor(() => {
			expect(screen.getByText('Transação 1')).toBeInTheDocument();
		});

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: 'Página 2' }));

		await waitFor(() => {
			expect(screen.getByText('Transação página 2')).toBeInTheDocument();
		});

		await user.click(screen.getByLabelText('Tipo'));
		await user.click(screen.getByRole('option', { name: 'Saída' }));

		await waitFor(() => {
			expect(screen.getByTestId('transaction-pagination-summary')).toHaveTextContent(
				'1 a 1 | 1 resultados',
			);
		});
	});

	it('shows filtered empty state when no transactions match', async () => {
		renderWithProviders(<TransactionsPage />, {
			mocks: buildPageMocks([
				getTransactionsMock({ items: [SAMPLE_TRANSACTION], totalCount: 1 }),
				getTransactionsMock({
					filters: { type: 'INCOME' },
					items: [],
					totalCount: 0,
				}),
			]),
		});

		await waitFor(() => {
			expect(screen.getByText('Jantar no Restaurante')).toBeInTheDocument();
		});

		const user = userEvent.setup();
		await user.click(screen.getByLabelText('Tipo'));
		await user.click(screen.getByRole('option', { name: 'Entrada' }));

		await waitFor(() => {
			expect(screen.getByTestId('transaction-empty-state')).toHaveTextContent(
				'Nenhum resultado encontrado',
			);
		});
	});
});
