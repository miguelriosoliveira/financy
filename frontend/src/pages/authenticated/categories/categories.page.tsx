import { ArrowUpDownIcon, PlusIcon, TagIcon, UtensilsIcon } from 'lucide-react';
import { Button } from '@/components/button';
import { CategoryCard } from './components/category-card';
import { HeaderCard } from './components/header-card';

export function CategoriesPage() {
	return (
		<div className="flex flex-col gap-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl">Categorias</h1>
					<h2 className="font-light text-gray-600">Organize suas transações por categorias</h2>
				</div>
				<Button className="px-3.5 py-5 font-light" size="sm">
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
				<CategoryCard />
				<CategoryCard />
				<CategoryCard />
				<CategoryCard />
				<CategoryCard />
				<CategoryCard />
				<CategoryCard />
				<CategoryCard />
			</div>
		</div>
	);
}
