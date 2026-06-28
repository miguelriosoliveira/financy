import { CombinedGraphQLErrors, gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { ERROR_CODES, type UpdateCategoryInputType } from '@financy/shared';
import { ArrowUpDownIcon, PlusIcon, TagIcon, UtensilsIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/button';
import type { TagColor } from '@/components/tag';
import { CategoryCard } from './components/category-card';
import { CategoryFormDialog } from './components/category-form-dialog';
import type { CategoryType } from './components/category-icon';
import { HeaderCard } from './components/header-card';

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

const EDIT_CATEGORY = gql`
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

type CategoryRow = {
	id: string;
	name: string;
	description: string | null;
	icon: CategoryType;
	color: TagColor;
};

type GetCategoriesResult = {
	getCategories: CategoryRow[];
};

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
	const [editingTarget, setEditingTarget] = useState<CategoryRow | null>(null);
	const [createServerError, setCreateServerError] = useState<string>();
	const [editServerError, setEditServerError] = useState<string>();
	const { data, loading: loadingCategories } = useQuery<GetCategoriesResult>(GET_CATEGORIES);
	const [createCategory, { loading: creatingCategory }] = useMutation(CREATE_CATEGORY);
	const [editCategory, { loading: editingCategory }] = useMutation(EDIT_CATEGORY);

	const categories = data?.getCategories ?? [];

	function handleCreateCategory(data: UpdateCategoryInputType) {
		setCreateServerError(undefined);
		createCategory({
			variables: { data },
			refetchQueries: [{ query: GET_CATEGORIES }],
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
			refetchQueries: [{ query: GET_CATEGORIES }],
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

	function handleDeleteCategory() {
		toast.error('Delete: Ainda não implementado');
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
						<Button className="px-4 py-4.5 font-light" size="sm">
							<PlusIcon className="size-4" />
							Nova categoria
						</Button>
					}
				/>
			</div>

			<div className="grid grid-cols-3 gap-6">
				<HeaderCard
					icon={<TagIcon className="text-gray-700" />}
					title="Total de categorias"
					value={String(categories.length)}
				/>
				<HeaderCard
					icon={<ArrowUpDownIcon className="text-purple-base" />}
					title="Total de transações"
					value="27"
				/>
				<HeaderCard
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
							onDelete={handleDeleteCategory}
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
		</div>
	);
}
