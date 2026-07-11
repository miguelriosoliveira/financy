import { CombinedGraphQLErrors, gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { ERROR_CODES, type UpdateCategoryInputType } from '@financy/shared';
import { ArrowUpDownIcon, PlusIcon, TagIcon, UtensilsIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/button';
import { type CategoryRow, GET_CATEGORIES, useCategories } from '@/hooks/use-categories';
import { CategoryCard } from './components/category-card';
import { CategoryFormDialog } from './components/category-form-dialog';
import { CategoryHeaderCard } from './components/category-header-card';
import { DeleteCategoryDialog } from './components/delete-category-dialog';

export const CREATE_CATEGORY = gql`
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

export const EDIT_CATEGORY = gql`
	mutation EditCategory($id: ID!, $data: UpdateCategoryInput!) {
		editCategory(id: $id, data: $data) {
			id
			name
			description
			icon
			color
		}
	}
`;

export const DELETE_CATEGORY = gql`
	mutation DeleteCategory($id: ID!) {
		deleteCategory(id: $id) {
			id
		}
	}
`;

const CATEGORY_RESPONSE_FIELD_MESSAGES: Record<string, string> = {
	[ERROR_CODES.CATEGORY_ALREADY_EXISTS]: 'Já existe uma categoria com esse título',
	[ERROR_CODES.CATEGORY_NOT_FOUND]: 'Categoria não encontrada',
};

function getGraphQLErrorCode(error: unknown): string | undefined {
	if (!CombinedGraphQLErrors.is(error)) {
		return undefined;
	}
	return error.errors[0]?.extensions?.code as string | undefined;
}

export function CategoriesPage() {
	const [createOpen, setCreateOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [editingTarget, setEditingTarget] = useState<CategoryRow | null>(null);
	const [deletingTarget, setDeletingTarget] = useState<CategoryRow | null>(null);
	const [createServerError, setCreateServerError] = useState<string>();
	const [editServerError, setEditServerError] = useState<string>();
	const { categories, loading: loadingCategories } = useCategories();
	const [createCategory, { loading: creatingCategory }] = useMutation(CREATE_CATEGORY);
	const [editCategory, { loading: editingCategory }] = useMutation(EDIT_CATEGORY);
	const [deleteCategory, { loading: deletingCategory }] = useMutation(DELETE_CATEGORY);

	function handleCreateCategory(data: UpdateCategoryInputType) {
		setCreateServerError(undefined);
		createCategory({
			variables: { data },
			refetchQueries: [{ query: GET_CATEGORIES, variables: { includeStats: false } }],
			awaitRefetchQueries: true,
		})
			.then(() => {
				toast.success('Categoria criada com sucesso');
				setCreateOpen(false);
			})
			.catch((error: unknown) => {
				const fieldMessage = CATEGORY_RESPONSE_FIELD_MESSAGES[getGraphQLErrorCode(error) ?? ''];
				if (fieldMessage) {
					setCreateServerError(fieldMessage);
					toast.error(fieldMessage);
					return;
				}
				toast.error('Erro ao criar categoria');
			});
	}

	function handleEditCategory(category: CategoryRow) {
		setEditingTarget(category);
		setEditServerError(undefined);
		setEditOpen(true);
	}

	function handleEditCategorySubmit(data: UpdateCategoryInputType) {
		if (!editingTarget) {
			return;
		}

		setEditServerError(undefined);
		editCategory({
			variables: { id: editingTarget.id, data },
			refetchQueries: [{ query: GET_CATEGORIES, variables: { includeStats: false } }],
			awaitRefetchQueries: true,
		})
			.then(() => {
				toast.success('Categoria editada com sucesso');
				setEditOpen(false);
				setEditingTarget(null);
			})
			.catch((error: unknown) => {
				const fieldMessage = CATEGORY_RESPONSE_FIELD_MESSAGES[getGraphQLErrorCode(error) ?? ''];
				if (fieldMessage) {
					setEditServerError(fieldMessage);
					toast.error(fieldMessage);
					return;
				}
				toast.error('Erro ao editar categoria');
			});
	}

	function handleDeleteCategory(category: CategoryRow) {
		setDeletingTarget(category);
		setDeleteOpen(true);
	}

	function handleConfirmDelete() {
		if (!deletingTarget) {
			return;
		}

		deleteCategory({
			variables: { id: deletingTarget.id },
			refetchQueries: [{ query: GET_CATEGORIES, variables: { includeStats: false } }],
			awaitRefetchQueries: true,
		})
			.then(() => {
				toast.success('Categoria excluída com sucesso');
				setDeleteOpen(false);
				setDeletingTarget(null);
			})
			.catch((error: unknown) => {
				const fieldMessage = CATEGORY_RESPONSE_FIELD_MESSAGES[getGraphQLErrorCode(error) ?? ''];
				if (fieldMessage) {
					toast.error(fieldMessage);
					return;
				}
				toast.error('Erro ao excluir categoria');
			});
	}

	return (
		<div className="flex flex-col gap-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl">Categorias</h1>
					<h2 className="font-light text-gray-600">Organize suas transações por categorias</h2>
				</div>
				<CategoryFormDialog
					mode="create"
					open={createOpen}
					onOpenChange={setCreateOpen}
					onSubmit={handleCreateCategory}
					loading={creatingCategory}
					serverError={createServerError}
					trigger={
						<Button size="sm">
							<PlusIcon className="size-4" />
							Nova categoria
						</Button>
					}
				/>
			</div>

			<div className="grid grid-cols-3 gap-6">
				<CategoryHeaderCard
					icon={<TagIcon className="text-gray-700" />}
					title="Total de categorias"
					value={String(categories.length)}
				/>
				<CategoryHeaderCard
					icon={<ArrowUpDownIcon className="text-purple-base" />}
					title="Total de transações"
					value="27"
				/>
				<CategoryHeaderCard
					icon={<UtensilsIcon className="text-blue-base" />}
					title="Categoria mais utilizada"
					value="Alimentação"
				/>
			</div>

			{loadingCategories ? (
				<p className="font-light text-gray-600">Carregando categorias...</p>
			) : categories.length === 0 ? (
				<p className="font-light text-gray-600">Nenhuma categoria ainda</p>
			) : (
				<div className="grid grid-cols-4 gap-4">
					{categories.map(category => (
						<CategoryCard
							key={category.id}
							category={category.icon}
							title={category.name}
							description={category.description ?? ''}
							itemCount={0}
							color={category.color}
							onDelete={() => handleDeleteCategory(category)}
							onEdit={() => handleEditCategory(category)}
						/>
					))}
				</div>
			)}

			<CategoryFormDialog
				mode="edit"
				open={editOpen}
				onOpenChange={open => {
					setEditOpen(open);
					if (!open) {
						setEditingTarget(null);
						setEditServerError(undefined);
					}
				}}
				initialValues={
					editingTarget
						? {
								name: editingTarget.name,
								description: editingTarget.description ?? '',
								icon: editingTarget.icon,
								color: editingTarget.color,
							}
						: undefined
				}
				onSubmit={handleEditCategorySubmit}
				loading={editingCategory}
				serverError={editServerError}
			/>

			<DeleteCategoryDialog
				open={deleteOpen}
				onOpenChange={open => {
					setDeleteOpen(open);
					if (!open) {
						setDeletingTarget(null);
					}
				}}
				categoryName={deletingTarget?.name}
				onConfirm={handleConfirmDelete}
				loading={deletingCategory}
			/>
		</div>
	);
}
