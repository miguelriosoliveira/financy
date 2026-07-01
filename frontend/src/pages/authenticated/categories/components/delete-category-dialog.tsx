import { Loader2Icon } from 'lucide-react';
import { Button as ShadcnButton } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	categoryName?: string;
	onConfirm: () => void;
	loading: boolean;
};

export function DeleteCategoryDialog({
	open,
	onOpenChange,
	categoryName,
	onConfirm,
	loading,
}: Props) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-base">Excluir categoria</DialogTitle>
					<DialogDescription className="font-light text-gray-600">
						Tem certeza que deseja excluir a categoria &quot;{categoryName}&quot;? Essa ação não
						pode ser desfeita.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<ShadcnButton variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
						Cancelar
					</ShadcnButton>
					<ShadcnButton variant="destructive" onClick={onConfirm} disabled={loading}>
						{loading ? <Loader2Icon className="animate-spin" /> : 'Excluir'}
					</ShadcnButton>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
