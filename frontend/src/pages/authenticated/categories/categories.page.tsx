import { CombinedGraphQLErrors, gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { createCategorySchema, ERROR_CODES } from '@financy/shared';
import { ArrowUpDownIcon, PlusIcon, TagIcon, UtensilsIcon } from 'lucide-react';
import { type SubmitEvent, useState } from 'react';
import { toast } from 'react-toastify';
import z from 'zod';
import { Button } from '@/components/button';
import { FormField } from '@/components/form-field';
import { SubmitButton } from '@/components/submit-button';
import type { TagColor } from '@/components/tag';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { CategoryCard } from './components/category-card';
import type { CategoryType } from './components/category-icon';
import { ColorSelector } from './components/color-selector';
import { HeaderCard } from './components/header-card';
import { IconSelector } from './components/icon-selector';

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

const CATEGORY_FIELD_MESSAGES: Record<'name', string> = {
	name: 'Informe o título da categoria',
};

const CATEGORY_RESPONSE_FIELD_MESSAGES: Record<string, string> = {
	[ERROR_CODES.CATEGORY_ALREADY_EXISTS]: 'Já existe uma categoria com esse título',
};

export function CategoriesPage() {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [icon, setIcon] = useState<CategoryType>('salary');
	const [color, setColor] = useState<TagColor>('green');
	const [errors, setErrors] = useState<Partial<Record<'name', string>>>({});
	const [createCategory, { loading }] = useMutation(CREATE_CATEGORY);

	function resetForm() {
		setName('');
		setDescription('');
		setIcon('salary');
		setColor('green');
		setErrors({});
	}

	function handleCreateCategory(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		const result = createCategorySchema.safeParse({ name, description, icon, color });
		if (!result.success) {
			const fieldErrors = z.treeifyError(result.error).properties;
			setErrors({
				...(fieldErrors?.name && { name: CATEGORY_FIELD_MESSAGES.name }),
			});
			return;
		}
		setErrors({});
		createCategory({ variables: { data: result.data } })
			.then(() => {
				toast.success('Categoria criada com sucesso');
				resetForm();
				setOpen(false);
			})
			.catch((error: unknown) => {
				const code = CombinedGraphQLErrors.is(error)
					? (error.errors[0]?.extensions?.code as string | undefined)
					: undefined;
				const fieldMessage = code ? CATEGORY_RESPONSE_FIELD_MESSAGES[code] : undefined;
				if (fieldMessage) {
					setErrors({ name: fieldMessage });
					toast.error(fieldMessage);
					return;
				}
				toast.error('Erro ao criar categoria');
			});
	}

	function handleDeleteCategory() {
		toast.error('Delete: Ainda não implementado');
	}

	function handleEditCategory() {
		toast.error('Edit: Ainda não implementado');
	}

	return (
		<div className="flex flex-col gap-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl">Categorias</h1>
					<h2 className="font-light text-gray-600">Organize suas transações por categorias</h2>
				</div>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button className="px-4 py-4.5 font-light" size="sm">
							<PlusIcon className="size-4" />
							Nova categoria
						</Button>
					</DialogTrigger>

					<DialogContent>
						<DialogHeader>
							<DialogTitle className="text-base">Nova categoria</DialogTitle>
							<DialogDescription className="font-light text-gray-600">
								Organize suas transações com categorias
							</DialogDescription>
						</DialogHeader>
						<form noValidate onSubmit={handleCreateCategory} className="flex flex-col gap-4">
							<FormField
								label="Título"
								id="title"
								placeholder="Ex. Alimentação"
								value={name}
								onChange={e => setName(e.target.value)}
								error={errors.name}
							/>
							<FormField
								label="Descrição"
								id="description"
								placeholder="Descrição da categoria"
								value={description}
								onChange={e => setDescription(e.target.value)}
							/>
							<IconSelector value={icon} onChange={setIcon} />
							<ColorSelector value={color} onChange={setColor} />
							<SubmitButton text="Salvar" loading={loading} />
						</form>
					</DialogContent>
				</Dialog>
			</div>

			<div className="grid grid-cols-3 gap-6">
				<HeaderCard
					icon={<TagIcon className="text-gray-700" />}
					title="Total de categorias"
					value="8"
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

			<div className="grid grid-cols-4 gap-4">
				<CategoryCard
					category="food"
					title="Alimentação"
					description="Restaurantes, delivery e refeições"
					itemCount={10}
					color="blue"
					onDelete={handleDeleteCategory}
					onEdit={handleEditCategory}
				/>
				<CategoryCard
					category="entertainment"
					title="Entretimento"
					description="Cinema, jogos e lazer"
					itemCount={2}
					color="pink"
					onDelete={handleDeleteCategory}
					onEdit={handleEditCategory}
				/>
				<CategoryCard
					category="investment"
					title="Investimento"
					description="Aplicações e retornos financeiros"
					itemCount={1}
					color="green"
					onDelete={handleDeleteCategory}
					onEdit={handleEditCategory}
				/>
				<CategoryCard
					category="groceries"
					title="Mercado"
					description="Compras de supermercado e mantimentos"
					itemCount={3}
					color="orange"
					onDelete={handleDeleteCategory}
					onEdit={handleEditCategory}
				/>
				<CategoryCard
					category="salary"
					title="Salário"
					description="Renda mensal e bonificações"
					itemCount={3}
					color="green"
					onDelete={handleDeleteCategory}
					onEdit={handleEditCategory}
				/>
				<CategoryCard
					category="health"
					title="Saúde"
					description="Medicamentos, consultas e exames"
					itemCount={0}
					color="red"
					onDelete={handleDeleteCategory}
					onEdit={handleEditCategory}
				/>
				<CategoryCard
					category="transport"
					title="Transporte"
					description="Gasolina, transporte público e viagens"
					itemCount={8}
					color="purple"
					onDelete={handleDeleteCategory}
					onEdit={handleEditCategory}
				/>
				<CategoryCard
					category="utilities"
					title="Utilidades"
					description="Energia, água, internet e telefone"
					itemCount={7}
					color="yellow"
					onDelete={handleDeleteCategory}
					onEdit={handleEditCategory}
				/>
			</div>
		</div>
	);
}
