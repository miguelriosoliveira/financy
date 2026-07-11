import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon, SquarePenIcon, TrashIcon } from 'lucide-react';
import { Button } from '@/components/button';
import { Tag } from '@/components/tag';
import { Button as ShadcnButton } from '@/components/ui/button';
import type { TransactionRow } from '@/hooks/use-transactions';
import { formatSignedAmount } from '@/lib/format-currency';
import { cn } from '@/lib/utils';
import { CategoryIcon } from '@/pages/authenticated/categories/components/category-icon';
import { TransactionTypeDisplay } from './transaction-type-display';

type TransactionTableProps = {
	transactions: TransactionRow[];
	totalCount: number;
	page: number;
	pageSize: number;
	loading: boolean;
	onPageChange: (page: number) => void;
	onEdit: (transaction: TransactionRow) => void;
	onDelete: (transaction: TransactionRow) => void;
};

function formatTransactionDate(date: string) {
	return format(parseISO(date), 'dd/MM/yy', { locale: ptBR });
}

function getPaginationRange(totalCount: number, page: number, pageSize: number) {
	if (totalCount === 0) {
		return { start: 0, end: 0 };
	}

	return {
		start: (page - 1) * pageSize + 1,
		end: Math.min(page * pageSize, totalCount),
	};
}

export function TransactionTable({
	transactions,
	totalCount,
	page,
	pageSize,
	loading,
	onPageChange,
	onEdit,
	onDelete,
}: TransactionTableProps) {
	const totalPages = Math.max(Math.ceil(totalCount / pageSize), 1);
	const { start, end } = getPaginationRange(totalCount, page, pageSize);
	const isFirstPage = page <= 1;
	const isLastPage = page >= totalPages || totalCount === 0;

	if (loading) {
		return <p className="font-light text-gray-600">Carregando transações...</p>;
	}

	if (transactions.length === 0) {
		return <p className="font-light text-gray-600">Nenhuma transação ainda</p>;
	}

	return (
		<div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
			<table className="w-full text-sm">
				<thead className="border-gray-300 border-b font-normal text-gray-500 uppercase">
					<tr>
						<th className="px-6 py-4 text-left">Descrição</th>
						<th className="px-6 py-4 text-center">Data</th>
						<th className="px-6 py-4 text-center">Categoria</th>
						<th className="px-6 py-4 text-center">Tipo</th>
						<th className="px-6 py-4 text-right">Valor</th>
						<th className="px-6 py-4 text-right">Ações</th>
					</tr>
				</thead>
				<tbody className="font-light text-gray-600">
					{transactions.map(transaction => (
						<tr
							key={transaction.id}
							className="border-gray-200 border-b last:border-b-0"
							data-testid={`transaction-row-${transaction.id}`}
						>
							<td className="px-6 py-4 text-left">
								<div className="flex items-center gap-3">
									<CategoryIcon
										category={transaction.category.icon}
										color={transaction.category.color}
									/>
									<span className="font-medium text-gray-800">{transaction.description}</span>
								</div>
							</td>
							<td className="px-6 py-4 text-center">{formatTransactionDate(transaction.date)}</td>
							<td className="px-6 py-4 text-center">
								<Tag color={transaction.category.color}>{transaction.category.name}</Tag>
							</td>
							<td className="px-6 py-4 text-center">
								<div className="flex justify-center">
									<TransactionTypeDisplay type={transaction.type} />
								</div>
							</td>
							<td
								className={cn(
									'px-6 py-4 text-right font-semibold',
									transaction.type === 'INCOME' ? 'text-green-base' : 'text-gray-800',
								)}
							>
								{formatSignedAmount(transaction.amount, transaction.type)}
							</td>
							<td className="px-6 py-4 text-right">
								<div className="flex items-center justify-end gap-2">
									<ShadcnButton
										variant="outline"
										size="icon"
										className="bg-white hover:bg-red-light"
										aria-label="Excluir transação"
										onClick={() => onDelete(transaction)}
									>
										<TrashIcon className="text-red-base" />
									</ShadcnButton>
									<ShadcnButton
										variant="outline"
										size="icon"
										className="bg-white hover:bg-gray-200"
										aria-label="Editar transação"
										onClick={() => onEdit(transaction)}
									>
										<SquarePenIcon className="text-gray-600" />
									</ShadcnButton>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			<div className="flex items-center justify-between border-gray-300 border-t px-6 py-4 font-light text-gray-600 text-sm">
				<span data-testid="transaction-pagination-summary">
					{start} a {end} | {totalCount} resultados
				</span>
				<div className="flex items-center gap-2">
					<Button
						color="secondary"
						size="sm"
						className="px-2 py-1.5"
						aria-label="Página anterior"
						disabled={isFirstPage}
						onClick={() => onPageChange(page - 1)}
					>
						<ChevronLeftIcon />
					</Button>
					{Array.from({ length: totalPages }, (_, index) => {
						const pageNumber = index + 1;
						const isActive = pageNumber === page;

						return (
							<Button
								key={pageNumber}
								color={isActive ? 'primary' : 'secondary'}
								size="sm"
								className="min-w-9 px-3 py-1.5"
								aria-label={`Página ${pageNumber}`}
								aria-current={isActive ? 'page' : undefined}
								onClick={() => onPageChange(pageNumber)}
							>
								{pageNumber}
							</Button>
						);
					})}
					<Button
						color="secondary"
						size="sm"
						className="px-2 py-1.5"
						aria-label="Próxima página"
						disabled={isLastPage}
						onClick={() => onPageChange(page + 1)}
					>
						<ChevronRightIcon />
					</Button>
				</div>
			</div>
		</div>
	);
}
