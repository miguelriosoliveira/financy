import { gql } from '@apollo/client';
import type { MockLink } from '@apollo/client/testing';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/tests/helpers/render';
import { CategoriesPage } from './categories.page';

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock('react-toastify', () => ({
	toast: {
		success: (...args: unknown[]) => mockToastSuccess(...args),
		error: (...args: unknown[]) => mockToastError(...args),
	},
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

const CREATE_CATEGORY = gql`
	mutation CreateCategory($data: CreateCategoryInput!) {
		createCategory(data: $data) {
			id
			name
			description
			icon
			color
		}
	}
`;

const VALID_CATEGORY = {
	name: 'Alimentação',
	description: '',
	icon: 'salary',
	color: 'green',
};

const CATEGORY_FIELD_MESSAGES = {
	name: 'Informe o título da categoria',
} as const;

const CATEGORY_ALREADY_EXISTS_MESSAGE = 'Já existe uma categoria com esse título';

type CategoryMock = {
	id: string;
	name: string;
	description: string | null;
	icon: string;
	color: string;
};

function getCategoriesMock(categories: CategoryMock[] = []): MockLink.MockedResponse {
	return {
		request: { query: GET_CATEGORIES },
		result: { data: { getCategories: categories } },
	};
}

function createCategorySuccessMock(data = VALID_CATEGORY): MockLink.MockedResponse {
	return {
		request: {
			query: CREATE_CATEGORY,
			variables: { data },
		},
		result: {
			data: {
				createCategory: {
					id: 'uuid-1',
					...data,
					description: data.description || null,
				},
			},
		},
	};
}

function createCategoryDuplicateMock(data = VALID_CATEGORY): MockLink.MockedResponse {
	return {
		request: {
			query: CREATE_CATEGORY,
			variables: { data },
		},
		result: {
			errors: [
				{
					message: 'Category already exists',
					extensions: { code: 'CATEGORY_ALREADY_EXISTS' },
				},
			],
		},
	};
}

function createCategoryUnexpectedErrorMock(data = VALID_CATEGORY): MockLink.MockedResponse {
	return {
		request: {
			query: CREATE_CATEGORY,
			variables: { data },
		},
		error: new Error('Network error'),
	};
}

async function openCreateCategoryDialog() {
	const user = userEvent.setup();
	await user.click(screen.getByRole('button', { name: 'Nova categoria' }));
	return user;
}

describe('CategoriesPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders the create trigger and form fields after opening the dialog', async () => {
		renderWithProviders(<CategoriesPage />, {
			mocks: [getCategoriesMock()],
		});

		expect(screen.getByRole('button', { name: 'Nova categoria' })).toBeInTheDocument();

		await openCreateCategoryDialog();

		expect(screen.getByLabelText('Título')).toBeInTheDocument();
		expect(screen.getByLabelText('Descrição')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
	});

	it('renders categories from the query and shows the total count', async () => {
		const categories: CategoryMock[] = [
			{
				id: 'uuid-1',
				name: 'Alimentação',
				description: 'Restaurantes e delivery',
				icon: 'food',
				color: 'blue',
			},
			{
				id: 'uuid-2',
				name: 'Transporte',
				description: null,
				icon: 'transport',
				color: 'purple',
			},
		];

		renderWithProviders(<CategoriesPage />, {
			mocks: [getCategoriesMock(categories)],
		});

		await waitFor(() => {
			expect(screen.queryByText('Carregando categorias...')).not.toBeInTheDocument();
		});

		expect(screen.getByRole('heading', { level: 3, name: 'Alimentação' })).toBeInTheDocument();
		expect(screen.getByRole('heading', { level: 3, name: 'Transporte' })).toBeInTheDocument();

		const totalLabel = screen.getByText('Total de categorias');
		const card = totalLabel.closest('[data-slot=card-content]');
		expect(card).toHaveTextContent('2');
	});

	it('shows the title validation message when submitting with an empty title', async () => {
		renderWithProviders(<CategoriesPage />, {
			mocks: [getCategoriesMock(), createCategorySuccessMock()],
		});

		const user = await openCreateCategoryDialog();
		await user.click(screen.getByRole('button', { name: 'Salvar' }));

		expect(await screen.findByText(CATEGORY_FIELD_MESSAGES.name)).toBeInTheDocument();
		expect(mockToastSuccess).not.toHaveBeenCalled();
		expect(mockToastError).not.toHaveBeenCalled();
	});

	it('creates a category successfully with default icon and color', async () => {
		const createdCategory: CategoryMock = {
			id: 'uuid-1',
			name: VALID_CATEGORY.name,
			description: null,
			icon: VALID_CATEGORY.icon,
			color: VALID_CATEGORY.color,
		};

		renderWithProviders(<CategoriesPage />, {
			mocks: [
				getCategoriesMock(),
				createCategorySuccessMock(),
				getCategoriesMock([createdCategory]),
			],
		});

		const user = await openCreateCategoryDialog();
		await user.type(screen.getByLabelText('Título'), VALID_CATEGORY.name);
		await user.click(screen.getByRole('button', { name: 'Salvar' }));

		await waitFor(() => {
			expect(mockToastSuccess).toHaveBeenCalledWith('Categoria criada com sucesso');
		});

		expect(mockToastError).not.toHaveBeenCalled();
	});

	it('shows a field error and toast when the category name already exists', async () => {
		renderWithProviders(<CategoriesPage />, {
			mocks: [getCategoriesMock(), createCategoryDuplicateMock()],
		});

		const user = await openCreateCategoryDialog();
		await user.type(screen.getByLabelText('Título'), VALID_CATEGORY.name);
		await user.click(screen.getByRole('button', { name: 'Salvar' }));

		expect(await screen.findByText(CATEGORY_ALREADY_EXISTS_MESSAGE)).toBeInTheDocument();

		await waitFor(() => {
			expect(mockToastError).toHaveBeenCalledWith(CATEGORY_ALREADY_EXISTS_MESSAGE);
		});

		expect(mockToastSuccess).not.toHaveBeenCalled();
	});

	it('shows a generic error toast when category creation fails unexpectedly', async () => {
		renderWithProviders(<CategoriesPage />, {
			mocks: [getCategoriesMock(), createCategoryUnexpectedErrorMock()],
		});

		const user = await openCreateCategoryDialog();
		await user.type(screen.getByLabelText('Título'), VALID_CATEGORY.name);
		await user.click(screen.getByRole('button', { name: 'Salvar' }));

		await waitFor(() => {
			expect(mockToastError).toHaveBeenCalledWith('Erro ao criar categoria');
		});

		expect(screen.queryByText(CATEGORY_ALREADY_EXISTS_MESSAGE)).not.toBeInTheDocument();
		expect(mockToastSuccess).not.toHaveBeenCalled();
	});
});
