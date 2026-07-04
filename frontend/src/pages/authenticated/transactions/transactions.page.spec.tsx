import type { MockLink } from '@apollo/client/testing';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET_CATEGORIES } from '@/hooks/use-categories';
import {
	DEFAULT_TRANSACTION_PAGE_SIZE,
	GET_TRANSACTIONS,
	type TransactionRow,
} from '@/hooks/use-transactions';
import { renderWithProviders } from '@/tests/helpers/render';
import { CREATE_TRANSACTION, TransactionsPage } from './transactions.page';

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

vi.mock('./components/transaction-form-dialog', () => ({
	TransactionFormDialog: ({
		onSubmit,
		open,
		onOpenChange,
	}: {
		onSubmit: (data: typeof VALID_TRANSACTION) => void;
		open: boolean;
		onOpenChange: (open: boolean) => void;
	}) => (
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
	),
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

const MUTATION_VARIABLES = {
	data: {
		amount: VALID_TRANSACTION.amount,
		type: VALID_TRANSACTION.type,
		description: VALID_TRANSACTION.description,
		date: VALID_TRANSACTION.date.toISOString(),
		categoryId: VALID_TRANSACTION.categoryId,
	},
};

function getCategoriesMock(categories: (typeof EXISTING_CATEGORY)[] = []): MockLink.MockedResponse {
	return {
		request: { query: GET_CATEGORIES },
		result: { data: { getCategories: categories } },
	};
}

function getTransactionsMock({
	page = 1,
	pageSize = DEFAULT_TRANSACTION_PAGE_SIZE,
	items = [SAMPLE_TRANSACTION],
	totalCount = items.length,
}: {
	page?: number;
	pageSize?: number;
	items?: TransactionRow[];
	totalCount?: number;
} = {}): MockLink.MockedResponse {
	return {
		request: {
			query: GET_TRANSACTIONS,
			variables: { page, pageSize },
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

describe('TransactionsPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders the create trigger and opens the dialog', async () => {
		renderWithProviders(<TransactionsPage />, {
			mocks: [
				getCategoriesMock([EXISTING_CATEGORY]),
				getTransactionsMock({ items: [], totalCount: 0 }),
			],
		});

		expect(screen.getByRole('button', { name: 'Nova transação' })).toBeInTheDocument();

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: 'Nova transação' }));

		expect(screen.getByRole('dialog', { name: 'Nova transação' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
	});

	it('shows loading then empty state when there are no transactions', async () => {
		renderWithProviders(<TransactionsPage />, {
			mocks: [
				getCategoriesMock([EXISTING_CATEGORY]),
				getTransactionsMock({ items: [], totalCount: 0 }),
			],
		});

		expect(screen.getByText('Carregando transações...')).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByText('Nenhuma transação ainda')).toBeInTheDocument();
		});
	});

	it('renders transactions from the query with formatted values', async () => {
		renderWithProviders(<TransactionsPage />, {
			mocks: [
				getCategoriesMock([EXISTING_CATEGORY]),
				getTransactionsMock({ items: [SAMPLE_TRANSACTION], totalCount: 1 }),
			],
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
			mocks: [
				getCategoriesMock([EXISTING_CATEGORY]),
				getTransactionsMock({
					items: createPaginatedTransactions(DEFAULT_TRANSACTION_PAGE_SIZE, 27, 1),
					totalCount: 27,
				}),
			],
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
			mocks: [
				getCategoriesMock([EXISTING_CATEGORY]),
				getTransactionsMock({
					items: createPaginatedTransactions(DEFAULT_TRANSACTION_PAGE_SIZE, 27, 1),
					totalCount: 27,
				}),
				getTransactionsMock({
					page: 2,
					items: [PAGE_TWO_TRANSACTION],
					totalCount: 27,
				}),
			],
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
			mocks: [
				getCategoriesMock([EXISTING_CATEGORY]),
				getTransactionsMock({ items: [], totalCount: 0 }),
				createTransactionSuccessMock(),
				getTransactionsMock({ items: [SAMPLE_TRANSACTION], totalCount: 1 }),
			],
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
			mocks: [
				getCategoriesMock([EXISTING_CATEGORY]),
				getTransactionsMock({ items: [], totalCount: 0 }),
				createTransactionCategoryNotFoundMock(),
			],
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
			mocks: [
				getCategoriesMock([EXISTING_CATEGORY]),
				getTransactionsMock({ items: [], totalCount: 0 }),
				createTransactionUnexpectedErrorMock(),
			],
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
});
