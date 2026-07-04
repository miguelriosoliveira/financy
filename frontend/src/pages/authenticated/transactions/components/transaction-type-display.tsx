import { ArrowDownCircleIcon, ArrowUpCircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type TransactionTypeDisplayProps = {
	type: 'INCOME' | 'EXPENSE';
};

export function TransactionTypeDisplay({ type }: TransactionTypeDisplayProps) {
	const isIncome = type === 'INCOME';

	return (
		<div
			className={cn(
				'flex items-center gap-2 font-medium',
				isIncome ? 'text-green-dark' : 'text-red-dark',
			)}
		>
			{isIncome ? (
				<ArrowUpCircleIcon className="size-4" />
			) : (
				<ArrowDownCircleIcon className="size-4" />
			)}
			<span>{isIncome ? 'Entrada' : 'Saída'}</span>
		</div>
	);
}
