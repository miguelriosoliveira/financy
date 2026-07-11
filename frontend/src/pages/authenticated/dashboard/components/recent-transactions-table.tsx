import { CombinedGraphQLErrors } from '@apollo/client';
import { type CreateTransactionInputType, ERROR_CODES } from '@financy/shared';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowDownCircleIcon, ArrowUpCircleIcon, ChevronRightIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import { Button } from '@/components/button';
import { Tag } from '@/components/tag';
import { GET_CATEGORIES } from '@/hooks/use-categories';
import { GET_TRANSACTIONS, useCreateTransaction, useTransactions } from '@/hooks/use-transactions';
import { formatSignedAmount } from '@/lib/format-currency';
import { cn } from '@/lib/utils';
import { CategoryIcon } from '@/pages/authenticated/categories/components/category-icon';
import { TransactionFormDialog } from '@/pages/authenticated/transactions/components/transaction-form-dialog';
import { GET_DASHBOARD_SUMMARY } from '../dashboard.queries';

const RECENT_TRANSACTIONS_PAGE_SIZE = 5;

const TRANSACTION_RESPONSE_FIELD_MESSAGES: Record<string, string> = {
	[ERROR_CODES.CATEGORY_NOT_FOUND]: 'Categoria não encontrada',
	[ERROR_CODES.TRANSACTION_NOT_FOUND]: 'Transação não encontrada',
};

function getGraphQLErrorCode(error: unknown): string | undefined {
	if (!CombinedGraphQLErrors.is(error)) {
		return undefined;
	}
	return error.errors[0]?.extensions?.code as string | undefined;
}

function formatTransactionDate(date: string) {
	return format(parseISO(date), 'dd/MM/yy', { locale: ptBR });
}

type RecentTransactionsTableProps = {
	categoryOptions: {
		id: string;
		name: string;
	}[];
	className?: string;
};

export function RecentTransactionsTable({
	categoryOptions,
	className,
}: RecentTransactionsTableProps) {
	const [createOpen, setCreateOpen] = useState(false);
	const [createServerError, setCreateServerError] = useState<string>();
	const { transactions, loading } = useTransactions({
		page: 1,
		pageSize: RECENT_TRANSACTIONS_PAGE_SIZE,
	});
	const [createTransaction, { loading: creatingTransaction }] = useCreateTransaction();

	function handleCreateTransaction(data: CreateTransactionInputType) {
		setCreateServerError(undefined);
		createTransaction({
			variables: {
				data: {
					...data,
					date: data.date.toISOString(),
				},
			},
			refetchQueries: [
				{ query: GET_DASHBOARD_SUMMARY },
				{
					query: GET_TRANSACTIONS,
					variables: { page: 1, pageSize: RECENT_TRANSACTIONS_PAGE_SIZE },
				},
				{ query: GET_CATEGORIES, variables: { includeStats: true } },
			],
			awaitRefetchQueries: true,
		})
			.then(() => {
				toast.success('Transação criada com sucesso');
				setCreateOpen(false);
			})
			.catch((error: unknown) => {
				const fieldMessage = TRANSACTION_RESPONSE_FIELD_MESSAGES[getGraphQLErrorCode(error) ?? ''];
				if (fieldMessage) {
					setCreateServerError(fieldMessage);
					toast.error(fieldMessage);
					return;
				}
				toast.error('Erro ao criar transação');
			});
	}

	return (
		<div className={cn('overflow-hidden rounded-xl border border-gray-300 bg-white', className)}>
			<table className="w-full text-sm">
				<thead className="border-gray-300 border-b font-normal text-gray-500 text-xs uppercase">
					<tr>
						<th className="w-full px-6 py-4 text-left">Transações Recentes</th>
						<th className="px-6 py-4" />
						<th className="whitespace-nowrap py-4 text-right">
							<Button color="link" size="sm">
								<Link to="/transactions" className="flex items-center gap-2">
									Ver todas
									<ChevronRightIcon className="size-5" />
								</Link>
							</Button>
						</th>
					</tr>
				</thead>
				<tbody className="font-light text-gray-600">
					{loading ? (
						<tr>
							<td colSpan={3} className="px-6 py-4">
								Carregando transações...
							</td>
						</tr>
					) : (
						transactions.map(transaction => (
							<tr
								key={transaction.id}
								className="border-gray-200 border-b"
								data-testid={`recent-transaction-row-${transaction.id}`}
							>
								<td className="w-full max-w-0 px-6 py-4 text-left">
									<div className="flex min-w-0 items-center gap-3">
										<CategoryIcon
											category={transaction.category.icon}
											color={transaction.category.color}
										/>
										<div className="flex min-w-0 flex-col gap-1">
											<span className="truncate font-medium text-base text-gray-800">
												{transaction.description}
											</span>
											<span className="text-gray-600 text-sm">
												{formatTransactionDate(transaction.date)}
											</span>
										</div>
									</div>
								</td>
								<td className="whitespace-nowrap px-6 py-4 text-right">
									<Tag color={transaction.category.color}>{transaction.category.name}</Tag>
								</td>
								<td className="whitespace-nowrap px-6 py-4 text-right">
									<div className="flex items-center justify-end gap-2">
										<span className="font-semibold text-gray-800">
											{formatSignedAmount(transaction.amount, transaction.type)}
										</span>
										{transaction.type === 'INCOME' ? (
											<ArrowUpCircleIcon className="size-4 text-green-dark" />
										) : (
											<ArrowDownCircleIcon className="size-4 text-red-dark" />
										)}
									</div>
								</td>
							</tr>
						))
					)}
					{!loading && transactions.length === 0 ? (
						<tr>
							<td colSpan={3} className="px-6 py-4">
								Nenhuma transação ainda
							</td>
						</tr>
					) : null}
					<tr>
						<td colSpan={3} className="px-6 py-4 text-center">
							<TransactionFormDialog
								mode="create"
								open={createOpen}
								onOpenChange={setCreateOpen}
								categories={categoryOptions}
								onSubmit={handleCreateTransaction}
								loading={creatingTransaction}
								serverError={createServerError}
								trigger={
									<Button color="link" size="sm">
										<PlusIcon className="size-4" />
										Nova transação
									</Button>
								}
							/>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}
