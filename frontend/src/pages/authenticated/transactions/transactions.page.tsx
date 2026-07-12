import { CombinedGraphQLErrors, gql } from '@apollo/client';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { type CreateTransactionInputType, ERROR_CODES } from '@financy/shared';
import { parseISO } from 'date-fns';
import { PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/button';
import { useCategories } from '@/hooks/use-categories';
import { GET_TRANSACTION_PERIODS, useTransactionPeriods } from '@/hooks/use-transaction-periods';
import {
	GET_TRANSACTIONS,
	type TransactionRow,
	useCreateTransaction,
	useTransactions,
} from '@/hooks/use-transactions';
import { invalidateTransactionDerivedCache } from '@/lib/invalidate-transaction-derived-cache';
import { DeleteTransactionDialog } from './components/delete-transaction-dialog';
import { TransactionFilters } from './components/transaction-filters';
import { TransactionFormDialog } from './components/transaction-form-dialog';
import { TransactionTable } from './components/transaction-table';
import {
	DEFAULT_TRANSACTION_FILTERS,
	hasActiveTransactionFilterState,
	shouldClearSelectedPeriod,
	type TransactionFiltersState,
	toGraphqlFilters,
} from './transaction-filters.state';

export const EDIT_TRANSACTION = gql`
	mutation EditTransaction($id: ID!, $data: UpdateTransactionInput!) {
		editTransaction(id: $id, data: $data) {
			id
			amount
			type
			description
			date
			categoryId
			userId
		}
	}
`;

export const DELETE_TRANSACTION = gql`
	mutation DeleteTransaction($id: ID!) {
		deleteTransaction(id: $id) {
			id
		}
	}
`;

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

export function TransactionsPage() {
	const client = useApolloClient();
	const [createOpen, setCreateOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [editingTarget, setEditingTarget] = useState<TransactionRow | null>(null);
	const [deletingTarget, setDeletingTarget] = useState<TransactionRow | null>(null);
	const [createServerError, setCreateServerError] = useState<string>();
	const [editServerError, setEditServerError] = useState<string>();
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState<TransactionFiltersState>(DEFAULT_TRANSACTION_FILTERS);
	const graphqlFilters = toGraphqlFilters(filters);
	const { categories } = useCategories();
	const { periods, loading: periodsLoading } = useTransactionPeriods();
	const { transactions, totalCount, pageSize, loading, queryVariables } = useTransactions({
		page,
		filters: graphqlFilters,
	});
	const [createTransaction, { loading: creatingTransaction }] = useCreateTransaction();
	const [editTransaction, { loading: editingTransaction }] = useMutation(EDIT_TRANSACTION);
	const [deleteTransaction, { loading: deletingTransaction }] = useMutation(DELETE_TRANSACTION);

	const categoryOptions = categories.map(category => ({ id: category.id, name: category.name }));
	const hasActiveFilters = hasActiveTransactionFilterState(filters);

	useEffect(() => {
		if (!shouldClearSelectedPeriod(periods, filters.period, periodsLoading)) {
			return;
		}

		setFilters(current => ({ ...current, period: 'all' }));
		setPage(1);
	}, [filters.period, periods, periodsLoading]);

	function handleFiltersChange(nextFilters: TransactionFiltersState) {
		setFilters(nextFilters);
		setPage(1);
	}

	function getMutationRefetchQueries() {
		return [
			{ query: GET_TRANSACTIONS, variables: queryVariables },
			{ query: GET_TRANSACTION_PERIODS },
		];
	}

	function handleCreateTransaction(data: CreateTransactionInputType) {
		setCreateServerError(undefined);
		createTransaction({
			variables: {
				data: {
					...data,
					date: data.date.toISOString(),
				},
			},
			refetchQueries: getMutationRefetchQueries(),
			awaitRefetchQueries: true,
			update: cache => invalidateTransactionDerivedCache(cache),
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

	function handleEditTransaction(transaction: TransactionRow) {
		setEditingTarget(transaction);
		setEditServerError(undefined);
		setEditOpen(true);
	}

	function handleEditTransactionSubmit(data: CreateTransactionInputType) {
		if (!editingTarget) {
			return;
		}

		setEditServerError(undefined);
		editTransaction({
			variables: {
				id: editingTarget.id,
				data: {
					...data,
					date: data.date.toISOString(),
				},
			},
			refetchQueries: getMutationRefetchQueries(),
			awaitRefetchQueries: true,
			update: cache => invalidateTransactionDerivedCache(cache),
		})
			.then(() => {
				toast.success('Transação editada com sucesso');
				setEditOpen(false);
				setEditingTarget(null);
			})
			.catch((error: unknown) => {
				const fieldMessage = TRANSACTION_RESPONSE_FIELD_MESSAGES[getGraphQLErrorCode(error) ?? ''];
				if (fieldMessage) {
					setEditServerError(fieldMessage);
					toast.error(fieldMessage);
					return;
				}
				toast.error('Erro ao editar transação');
			});
	}

	function handleDeleteTransaction(transaction: TransactionRow) {
		setDeletingTarget(transaction);
		setDeleteOpen(true);
	}

	function handleConfirmDelete() {
		if (!deletingTarget) {
			return;
		}

		deleteTransaction({
			variables: { id: deletingTarget.id },
			refetchQueries: getMutationRefetchQueries(),
			awaitRefetchQueries: true,
			update: cache => invalidateTransactionDerivedCache(cache),
		})
			.then(async () => {
				const cached = client.readQuery<{
					getTransactions: { totalCount: number };
				}>({
					query: GET_TRANSACTIONS,
					variables: queryVariables,
				});

				let targetPage = page;
				if (cached) {
					const { totalCount: updatedTotalCount } = cached.getTransactions;
					const lastPage = Math.max(Math.ceil(updatedTotalCount / pageSize), 1);
					if (page > lastPage) {
						targetPage = lastPage;
					}
				}

				if (targetPage !== page) {
					await client.query({
						query: GET_TRANSACTIONS,
						variables: { ...queryVariables, page: targetPage },
						fetchPolicy: 'network-only',
					});
					setPage(targetPage);
				}

				toast.success('Transação excluída com sucesso');
				setDeleteOpen(false);
				setDeletingTarget(null);
			})
			.catch((error: unknown) => {
				const fieldMessage = TRANSACTION_RESPONSE_FIELD_MESSAGES[getGraphQLErrorCode(error) ?? ''];
				if (fieldMessage) {
					toast.error(fieldMessage);
					return;
				}
				toast.error('Erro ao excluir transação');
			});
	}

	return (
		<div className="flex flex-col gap-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl">Transações</h1>
					<h2 className="font-light text-gray-600">
						Gerencie todas as suas transações financeiras
					</h2>
				</div>
				<TransactionFormDialog
					mode="create"
					open={createOpen}
					onOpenChange={setCreateOpen}
					categories={categoryOptions}
					onSubmit={handleCreateTransaction}
					loading={creatingTransaction}
					serverError={createServerError}
					trigger={
						<Button size="sm">
							<PlusIcon className="size-4" />
							Nova transação
						</Button>
					}
				/>
			</div>

			<TransactionFilters
				value={filters}
				onChange={handleFiltersChange}
				categories={categoryOptions}
				periods={periods}
				periodsLoading={periodsLoading}
			/>
			<TransactionTable
				transactions={transactions}
				totalCount={totalCount}
				page={page}
				pageSize={pageSize}
				loading={loading}
				hasActiveFilters={hasActiveFilters}
				onPageChange={setPage}
				onEdit={handleEditTransaction}
				onDelete={handleDeleteTransaction}
			/>

			<TransactionFormDialog
				mode="edit"
				open={editOpen}
				onOpenChange={open => {
					setEditOpen(open);
					if (!open) {
						setEditingTarget(null);
						setEditServerError(undefined);
					}
				}}
				categories={categoryOptions}
				initialValues={
					editingTarget
						? {
								type: editingTarget.type,
								description: editingTarget.description ?? '',
								date: parseISO(editingTarget.date),
								amount: String(editingTarget.amount),
								categoryId: editingTarget.category.id,
							}
						: undefined
				}
				onSubmit={handleEditTransactionSubmit}
				loading={editingTransaction}
				serverError={editServerError}
			/>

			<DeleteTransactionDialog
				open={deleteOpen}
				onOpenChange={open => {
					setDeleteOpen(open);
					if (!open) {
						setDeletingTarget(null);
					}
				}}
				transactionDescription={deletingTarget?.description ?? undefined}
				onConfirm={handleConfirmDelete}
				loading={deletingTransaction}
			/>
		</div>
	);
}
