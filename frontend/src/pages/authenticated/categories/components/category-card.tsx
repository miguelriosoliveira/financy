import { SquarePenIcon, TrashIcon } from 'lucide-react';
import { Tag, type TagColor } from '@/components/tag';
import { Button as ShadcnButton } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { CategoryIcon, type CategoryType } from './category-icon';

type Props = {
	category: CategoryType;
	title: string;
	description: string;
	itemCount: number;
	color: TagColor;
	onDelete: () => void;
	onEdit: () => void;
};

export function CategoryCard({
	category,
	title,
	description,
	itemCount,
	color,
	onDelete,
	onEdit,
}: Props) {
	return (
		<Card className="min-h-56">
			<CardHeader>
				<div className="flex justify-between">
					<CategoryIcon category={category} color={color} />

					<div className="flex gap-2">
						<ShadcnButton
							variant="outline"
							size="icon"
							className="bg-white hover:bg-gray-200"
							onClick={onDelete}
							aria-label="Excluir categoria"
						>
							<TrashIcon className="text-destructive" />
						</ShadcnButton>
						<ShadcnButton
							variant="outline"
							size="icon"
							className="bg-white hover:bg-gray-200"
							onClick={onEdit}
							aria-label="Editar categoria"
						>
							<SquarePenIcon className="text-gray-700" />
						</ShadcnButton>
					</div>
				</div>
			</CardHeader>

			<CardContent className="flex flex-1 flex-col gap-1">
				<h3 className="font-semibold text-base">{title}</h3>
				<span className="font-light text-gray-600 text-sm">{description}</span>
			</CardContent>

			<CardFooter className="flex items-center justify-between">
				<Tag color={color}>{title}</Tag>
				<span className="font-light text-gray-600 text-sm">
					{itemCount} {itemCount === 1 ? 'item' : 'itens'}
				</span>
			</CardFooter>
		</Card>
	);
}
