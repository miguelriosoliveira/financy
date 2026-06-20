import { ArrowUpDownIcon, PlusIcon, TagIcon, UtensilsIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/button';
import { CategoryCard } from './components/category-card';
import { HeaderCard } from './components/header-card';

export function CategoriesPage() {
	function handleCreateCategory() {
		toast.error('Create: Ainda não implementado');
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
				<Button className="px-4 py-4.5 font-light" size="sm" onClick={handleCreateCategory}>
					<PlusIcon className="size-4" />
					Nova categoria
				</Button>
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
