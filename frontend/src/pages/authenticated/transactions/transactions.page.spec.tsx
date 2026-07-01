import { gql } from '@apollo/client';
import type { MockLink } from '@apollo/client/testing';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/tests/helpers/render';
import { TransactionsPage } from './transactions.page';

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

const GET_CATEGORIES = gql`
	query GetCategories {
		getCategories {
			id
			name
			description
			icon
			color
		}
	}
`;

const CREATE_TRANSACTION = gql`
	mutation CreateTransaction($data: CreateTransactionInput!) {
		createTransaction(data: $data) {
			id
			amount
			type
			description
			date
			categoryId
			userId
		}
	}
`;

const EXISTING_CATEGORY = {
	id: 'category-1',
	name: 'Alimentação',
	description: 'Restaurantes e delivery',
	icon: 'food',
	color: 'blue',
};

const CATEGORY_NOT_FOUND_MESSAGE = 'Categoria não encontrada';

function getCategoriesMock(categories: (typeof EXISTING_CATEGORY)[] = []): MockLink.MockedResponse {
	return {
		request: { query: GET_CATEGORIES },
		result: { data: { getCategories: categories } },
	};
}

const MUTATION_VARIABLES = {
	data: {
		amount: VALID_TRANSACTION.amount,
		type: VALID_TRANSACTION.type,
		description: VALID_TRANSACTION.description,
		date: VALID_TRANSACTION.date.toISOString(),
		categoryId: VALID_TRANSACTION.categoryId,
	},
};

function createTransactionSuccessMock(): MockLink.MockedResponse {
	return {
		request: {
			query: CREATE_TRANSACTION,
			variables: MUTATION_VARIABLES,
		},
		result: {
			data: {
				createTransaction: {
					id: 'transaction-1',
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
			mocks: [getCategoriesMock([EXISTING_CATEGORY])],
		});

		expect(screen.getByRole('button', { name: 'Nova transação' })).toBeInTheDocument();

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: 'Nova transação' }));

		expect(screen.getByRole('dialog', { name: 'Nova transação' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
	});

	it('creates a transaction successfully', async () => {
		renderWithProviders(<TransactionsPage />, {
			mocks: [getCategoriesMock([EXISTING_CATEGORY]), createTransactionSuccessMock()],
		});

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: 'Nova transação' }));
		await user.click(screen.getByRole('button', { name: 'Salvar' }));

		await waitFor(() => {
			expect(mockToastSuccess).toHaveBeenCalledWith('Transação criada com sucesso');
		});

		expect(mockToastError).not.toHaveBeenCalled();
	});

	it('shows a field error and toast when the category is not found', async () => {
		renderWithProviders(<TransactionsPage />, {
			mocks: [getCategoriesMock([EXISTING_CATEGORY]), createTransactionCategoryNotFoundMock()],
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
			mocks: [getCategoriesMock([EXISTING_CATEGORY]), createTransactionUnexpectedErrorMock()],
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
