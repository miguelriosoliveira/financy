import { SquarePenIcon, TrashIcon, UtensilsIcon } from 'lucide-react';
import { Button } from '@/components/button';
import { Card, CardContent } from '@/components/ui/card';

export function CategoryCard() {
	return (
		<Card>
			<CardContent>
				<div className="flex justify-between">
					<div className="rounded-md bg-blue-light p-3">
						<UtensilsIcon className="text-blue-base" size={16} />
					</div>
					<div className="flex gap-2">
						<Button variant="outline" size="icon" className="bg-white hover:bg-gray-200">
							<TrashIcon className="text-destructive" />
						</Button>
						<Button variant="outline" size="icon" className="bg-white hover:bg-gray-200">
							<SquarePenIcon className="text-gray-700" />
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
