import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/button';

export function CategoriesPage() {
	return (
		<div className="flex items-center justify-between">
			<div>
				<h1 className="font-bold text-2xl">Categorias</h1>
				<h2 className="font-light text-gray-600">Organize suas transações por categorias</h2>
			</div>
			<Button className="px-4 py-5" size="sm">
				<PlusIcon className="size-4" />
				Nova categoria
			</Button>
		</div>
	);
}
