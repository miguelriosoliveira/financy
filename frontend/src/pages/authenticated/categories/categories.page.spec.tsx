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
		renderWithProviders(<CategoriesPage />);

		expect(screen.getByRole('button', { name: 'Nova categoria' })).toBeInTheDocument();

		await openCreateCategoryDialog();

		expect(screen.getByLabelText('Título')).toBeInTheDocument();
		expect(screen.getByLabelText('Descrição')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
	});

	it('shows the title validation message when submitting with an empty title', async () => {
		renderWithProviders(<CategoriesPage />, {
			mocks: [createCategorySuccessMock()],
		});

		const user = await openCreateCategoryDialog();
		await user.click(screen.getByRole('button', { name: 'Salvar' }));

		expect(await screen.findByText(CATEGORY_FIELD_MESSAGES.name)).toBeInTheDocument();
		expect(mockToastSuccess).not.toHaveBeenCalled();
		expect(mockToastError).not.toHaveBeenCalled();
	});

	it('creates a category successfully with default icon and color', async () => {
		renderWithProviders(<CategoriesPage />, {
			mocks: [createCategorySuccessMock()],
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
			mocks: [createCategoryDuplicateMock()],
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
			mocks: [createCategoryUnexpectedErrorMock()],
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
