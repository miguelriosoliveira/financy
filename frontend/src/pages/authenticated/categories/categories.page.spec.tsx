import { InMemoryCache } from '@apollo/client';
import type { MockLink } from '@apollo/client/testing';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET_CATEGORIES } from '@/hooks/use-categories';
import { renderWithProviders } from '@/tests/helpers/render';
import { CategoriesPage, CREATE_CATEGORY, DELETE_CATEGORY, EDIT_CATEGORY } from './categories.page';
import { GET_CATEGORIES_SUMMARY } from './categories.queries';

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock('react-toastify', () => ({
	toast: {
		success: (...args: unknown[]) => mockToastSuccess(...args),
		error: (...args: unknown[]) => mockToastError(...args),
	},
}));

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

const EXISTING_CATEGORY: CategoryMock = {
	id: 'uuid-1',
	name: 'Alimentação',
	description: 'Restaurantes e delivery',
	icon: 'food',
	color: 'blue',
};

const OTHER_CATEGORY: CategoryMock = {
	id: 'uuid-2',
	name: 'Transporte',
	description: null,
	icon: 'transport',
	color: 'purple',
};

const UPDATED_CATEGORY = {
	name: 'Alimentação Atualizada',
	description: 'Restaurantes e delivery',
	icon: 'food',
	color: 'blue',
};

type CategoriesSummaryMock = {
	transactionCount: number;
	mostUsedCategory: {
		id: string;
		name: string;
		transactionCount: number;
		icon: string;
		color: string;
	} | null;
};

const EMPTY_SUMMARY: CategoriesSummaryMock = {
	transactionCount: 0,
	mostUsedCategory: null,
};

const POPULATED_SUMMARY: CategoriesSummaryMock = {
	transactionCount: 5,
	mostUsedCategory: {
		id: 'uuid-1',
		name: 'Alimentação',
		transactionCount: 3,
		icon: 'food',
		color: 'blue',
	},
};

function getCategoriesSummaryMock(
	summary: CategoriesSummaryMock = EMPTY_SUMMARY,
): MockLink.MockedResponse {
	return {
		request: { query: GET_CATEGORIES_SUMMARY },
		result: { data: { getCategoriesSummary: summary } },
	};
}

function buildMocks(mocks: MockLink.MockedResponse[] = []) {
	return [getCategoriesSummaryMock(), ...mocks];
}

function getHeaderCardContent(title: string) {
	const label = screen.getByText(title);
	const card = label.closest('[data-slot=card-content]');
	expect(card).not.toBeNull();
	return card as HTMLElement;
}

function getCategoriesMock(categories: CategoryMock[] = []): MockLink.MockedResponse {
	return {
		request: { query: GET_CATEGORIES, variables: { includeStats: true } },
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

function editCategorySuccessMock(
	id = EXISTING_CATEGORY.id,
	data = UPDATED_CATEGORY,
): MockLink.MockedResponse {
	return {
		request: {
			query: EDIT_CATEGORY,
			variables: { id, data },
		},
		result: {
			data: {
				editCategory: {
					id,
					...data,
					description: data.description || null,
				},
			},
		},
	};
}

function editCategoryDuplicateMock(
	id = EXISTING_CATEGORY.id,
	data = UPDATED_CATEGORY,
): MockLink.MockedResponse {
	return {
		request: {
			query: EDIT_CATEGORY,
			variables: { id, data },
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

function deleteCategorySuccessMock(id = EXISTING_CATEGORY.id): MockLink.MockedResponse {
	return {
		request: {
			query: DELETE_CATEGORY,
			variables: { id },
		},
		result: {
			data: {
				deleteCategory: { id },
			},
		},
	};
}

function deleteCategoryUnexpectedErrorMock(id = EXISTING_CATEGORY.id): MockLink.MockedResponse {
	return {
		request: {
			query: DELETE_CATEGORY,
			variables: { id },
		},
		error: new Error('Network error'),
	};
}

async function openCreateCategoryDialog() {
	const user = userEvent.setup();
	await user.click(screen.getByRole('button', { name: 'Nova categoria' }));
	return user;
}

async function openEditCategoryDialog(categoryName = EXISTING_CATEGORY.name) {
	const user = userEvent.setup();

	await waitFor(() => {
		expect(screen.getByRole('heading', { level: 3, name: categoryName })).toBeInTheDocument();
	});

	const cardHeading = screen.getByRole('heading', { level: 3, name: categoryName });
	const card = cardHeading.closest('[data-slot=card]');
	expect(card).not.toBeNull();

	await user.click(within(card as HTMLElement).getByRole('button', { name: 'Editar categoria' }));

	await waitFor(() => {
		expect(screen.getByRole('dialog', { name: 'Editar categoria' })).toBeInTheDocument();
	});

	return user;
}

async function openDeleteCategoryDialog(categoryName = EXISTING_CATEGORY.name) {
	const user = userEvent.setup();

	await waitFor(() => {
		expect(screen.getByRole('heading', { level: 3, name: categoryName })).toBeInTheDocument();
	});

	const cardHeading = screen.getByRole('heading', { level: 3, name: categoryName });
	const card = cardHeading.closest('[data-slot=card]');
	expect(card).not.toBeNull();

	await user.click(within(card as HTMLElement).getByRole('button', { name: 'Excluir categoria' }));

	await waitFor(() => {
		expect(screen.getByRole('dialog', { name: 'Excluir categoria' })).toBeInTheDocument();
	});

	return user;
}

describe('CategoriesPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders the create trigger and form fields after opening the dialog', async () => {
		renderWithProviders(<CategoriesPage />, {
			mocks: buildMocks([getCategoriesMock()]),
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
			mocks: [getCategoriesSummaryMock(POPULATED_SUMMARY), getCategoriesMock(categories)],
		});

		await waitFor(() => {
			expect(screen.queryByText('Carregando categorias...')).not.toBeInTheDocument();
		});

		expect(screen.getByRole('heading', { level: 3, name: 'Alimentação' })).toBeInTheDocument();
		expect(screen.getByRole('heading', { level: 3, name: 'Transporte' })).toBeInTheDocument();

		const totalLabel = screen.getByText('Total de categorias');
		const card = totalLabel.closest('[data-slot=card-content]');
		expect(card).toHaveTextContent('2');

		await waitFor(() => {
			expect(getHeaderCardContent('Total de transações')).toHaveTextContent('5');
			expect(getHeaderCardContent('Categoria mais utilizada')).toHaveTextContent('Alimentação');
		});
	});

	it('shows zero transactions and an empty most-used placeholder when there are no transactions', async () => {
		renderWithProviders(<CategoriesPage />, {
			mocks: buildMocks([getCategoriesMock()]),
		});

		await waitFor(() => {
			expect(screen.queryByText('Carregando categorias...')).not.toBeInTheDocument();
		});

		expect(getHeaderCardContent('Total de transações')).toHaveTextContent('0');
		expect(getHeaderCardContent('Categoria mais utilizada')).toHaveTextContent('—');
	});

	it('shows the title validation message when submitting with an empty title', async () => {
		renderWithProviders(<CategoriesPage />, {
			mocks: buildMocks([getCategoriesMock(), createCategorySuccessMock()]),
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
			mocks: buildMocks([
				getCategoriesMock(),
				createCategorySuccessMock(),
				getCategoriesMock([createdCategory]),
				getCategoriesSummaryMock(),
			]),
		});

		const user = await openCreateCategoryDialog();
		await user.type(screen.getByLabelText('Título'), VALID_CATEGORY.name);
		await user.click(screen.getByRole('button', { name: 'Salvar' }));

		await waitFor(() => {
			expect(mockToastSuccess).toHaveBeenCalledWith('Categoria criada com sucesso');
		});

		expect(mockToastError).not.toHaveBeenCalled();
	});

	it('refetches the category list after creating a category', async () => {
		const cache = new InMemoryCache();
		cache.writeQuery({
			query: GET_CATEGORIES,
			variables: { includeStats: true },
			data: {
				getCategories: [
					{
						...OTHER_CATEGORY,
						transactionCount: 0,
						totalAmount: 0,
					},
				],
			},
		});

		renderWithProviders(<CategoriesPage />, {
			cache,
			mocks: buildMocks([
				getCategoriesMock([OTHER_CATEGORY]),
				createCategorySuccessMock(),
				getCategoriesMock([OTHER_CATEGORY]),
				getCategoriesSummaryMock(),
			]),
		});

		const user = await openCreateCategoryDialog();
		await user.type(screen.getByLabelText('Título'), VALID_CATEGORY.name);
		await user.click(screen.getByRole('button', { name: 'Salvar' }));

		await waitFor(() => {
			expect(mockToastSuccess).toHaveBeenCalledWith('Categoria criada com sucesso');
		});

		await waitFor(() => {
			expect(
				cache.readQuery({
					query: GET_CATEGORIES,
					variables: { includeStats: true },
				}),
			).toEqual({
				getCategories: [
					{
						...OTHER_CATEGORY,
						transactionCount: null,
						totalAmount: null,
					},
				],
			});
		});
	});

	it('shows a field error and toast when the category name already exists', async () => {
		renderWithProviders(<CategoriesPage />, {
			mocks: buildMocks([getCategoriesMock(), createCategoryDuplicateMock()]),
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
			mocks: buildMocks([getCategoriesMock(), createCategoryUnexpectedErrorMock()]),
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

	it('opens the edit dialog with prefilled values from the selected category', async () => {
		renderWithProviders(<CategoriesPage />, {
			mocks: buildMocks([getCategoriesMock([EXISTING_CATEGORY])]),
		});

		await openEditCategoryDialog();

		const dialog = screen.getByRole('dialog', { name: 'Editar categoria' });
		expect(within(dialog).getByLabelText('Título')).toHaveValue(EXISTING_CATEGORY.name);
		expect(within(dialog).getByLabelText('Descrição')).toHaveValue(EXISTING_CATEGORY.description);
	});

	it('edits a category successfully', async () => {
		const editedCategory: CategoryMock = {
			id: EXISTING_CATEGORY.id,
			name: UPDATED_CATEGORY.name,
			description: UPDATED_CATEGORY.description,
			icon: UPDATED_CATEGORY.icon,
			color: UPDATED_CATEGORY.color,
		};

		renderWithProviders(<CategoriesPage />, {
			mocks: buildMocks([
				getCategoriesMock([EXISTING_CATEGORY]),
				editCategorySuccessMock(),
				getCategoriesMock([editedCategory]),
				getCategoriesSummaryMock(),
			]),
		});

		const user = await openEditCategoryDialog();
		const dialog = screen.getByRole('dialog', { name: 'Editar categoria' });
		const titleInput = within(dialog).getByLabelText('Título');

		await user.clear(titleInput);
		await user.type(titleInput, UPDATED_CATEGORY.name);
		await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

		await waitFor(() => {
			expect(mockToastSuccess).toHaveBeenCalledWith('Categoria editada com sucesso');
		});

		expect(mockToastError).not.toHaveBeenCalled();
	});

	it('shows a field error and toast when editing to an existing category name', async () => {
		renderWithProviders(<CategoriesPage />, {
			mocks: buildMocks([getCategoriesMock([EXISTING_CATEGORY]), editCategoryDuplicateMock()]),
		});

		const user = await openEditCategoryDialog();
		const dialog = screen.getByRole('dialog', { name: 'Editar categoria' });
		const titleInput = within(dialog).getByLabelText('Título');

		await user.clear(titleInput);
		await user.type(titleInput, UPDATED_CATEGORY.name);
		await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

		expect(await within(dialog).findByText(CATEGORY_ALREADY_EXISTS_MESSAGE)).toBeInTheDocument();

		await waitFor(() => {
			expect(mockToastError).toHaveBeenCalledWith(CATEGORY_ALREADY_EXISTS_MESSAGE);
		});

		expect(mockToastSuccess).not.toHaveBeenCalled();
	});

	it('opens the delete confirmation dialog when clicking the trash button', async () => {
		renderWithProviders(<CategoriesPage />, {
			mocks: buildMocks([getCategoriesMock([EXISTING_CATEGORY])]),
		});

		await openDeleteCategoryDialog();

		const dialog = screen.getByRole('dialog', { name: 'Excluir categoria' });
		expect(within(dialog).getByText(/Alimentação/)).toBeInTheDocument();
		expect(mockToastSuccess).not.toHaveBeenCalled();
		expect(mockToastError).not.toHaveBeenCalled();
	});

	it('closes the delete dialog without calling the mutation when cancelled', async () => {
		renderWithProviders(<CategoriesPage />, {
			mocks: buildMocks([getCategoriesMock([EXISTING_CATEGORY])]),
		});

		const user = await openDeleteCategoryDialog();
		const dialog = screen.getByRole('dialog', { name: 'Excluir categoria' });
		await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }));

		await waitFor(() => {
			expect(screen.queryByRole('dialog', { name: 'Excluir categoria' })).not.toBeInTheDocument();
		});

		expect(
			screen.getByRole('heading', { level: 3, name: EXISTING_CATEGORY.name }),
		).toBeInTheDocument();
		expect(mockToastSuccess).not.toHaveBeenCalled();
	});

	it('deletes a category successfully and removes it from the list', async () => {
		renderWithProviders(<CategoriesPage />, {
			mocks: buildMocks([
				getCategoriesMock([EXISTING_CATEGORY, OTHER_CATEGORY]),
				deleteCategorySuccessMock(),
				getCategoriesMock([OTHER_CATEGORY]),
				getCategoriesSummaryMock(),
			]),
		});

		const user = await openDeleteCategoryDialog();
		const dialog = screen.getByRole('dialog', { name: 'Excluir categoria' });
		await user.click(within(dialog).getByRole('button', { name: 'Excluir' }));

		await waitFor(() => {
			expect(mockToastSuccess).toHaveBeenCalledWith('Categoria excluída com sucesso');
		});

		await waitFor(() => {
			expect(
				screen.queryByRole('heading', { level: 3, name: EXISTING_CATEGORY.name }),
			).not.toBeInTheDocument();
		});

		expect(
			screen.getByRole('heading', { level: 3, name: OTHER_CATEGORY.name }),
		).toBeInTheDocument();
		expect(mockToastError).not.toHaveBeenCalled();
	});

	it('shows a generic error toast when category deletion fails unexpectedly', async () => {
		renderWithProviders(<CategoriesPage />, {
			mocks: buildMocks([
				getCategoriesMock([EXISTING_CATEGORY]),
				deleteCategoryUnexpectedErrorMock(),
			]),
		});

		const user = await openDeleteCategoryDialog();
		const dialog = screen.getByRole('dialog', { name: 'Excluir categoria' });
		await user.click(within(dialog).getByRole('button', { name: 'Excluir' }));

		await waitFor(() => {
			expect(mockToastError).toHaveBeenCalledWith('Erro ao excluir categoria');
		});

		expect(
			screen.getByRole('heading', { level: 3, name: EXISTING_CATEGORY.name, hidden: true }),
		).toBeInTheDocument();
		expect(mockToastSuccess).not.toHaveBeenCalled();
	});
});
