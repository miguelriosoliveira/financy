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
	transactionDescription?: string;
	onConfirm: () => void;
	loading: boolean;
};

export function DeleteTransactionDialog({
	open,
	onOpenChange,
	transactionDescription,
	onConfirm,
	loading,
}: Props) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-base">Excluir transação</DialogTitle>
					<DialogDescription className="font-light text-gray-600">
						Tem certeza que deseja excluir a transação &quot;{transactionDescription}&quot;? Essa
						ação não pode ser desfeita.
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
