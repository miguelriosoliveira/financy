import { CombinedGraphQLErrors, gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { type CreateTransactionInputType, ERROR_CODES } from '@financy/shared';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/button';
import { useCategories } from '@/hooks/use-categories';
import { GET_TRANSACTIONS, useTransactions } from '@/hooks/use-transactions';
import { TransactionFilters } from './components/transaction-filters';
import { TransactionFormDialog } from './components/transaction-form-dialog';
import { TransactionTable } from './components/transaction-table';

export const CREATE_TRANSACTION = gql`
	mutation CreateTransaction($data: CreateTransactionInput!) {
		createTransaction(data: $data) {
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

const TRANSACTION_RESPONSE_FIELD_MESSAGES: Record<string, string> = {
	[ERROR_CODES.CATEGORY_NOT_FOUND]: 'Categoria não encontrada',
};

function getGraphQLErrorCode(error: unknown): string | undefined {
	if (!CombinedGraphQLErrors.is(error)) {
		return undefined;
	}
	return error.errors[0]?.extensions?.code as string | undefined;
}

export function TransactionsPage() {
	const [createOpen, setCreateOpen] = useState(false);
	const [createServerError, setCreateServerError] = useState<string>();
	const [page, setPage] = useState(1);
	const { categories } = useCategories();
	const { transactions, totalCount, pageSize, loading } = useTransactions({ page });
	const [createTransaction, { loading: creatingTransaction }] = useMutation(CREATE_TRANSACTION);

	function handleCreateTransaction(data: CreateTransactionInputType) {
		setCreateServerError(undefined);
		createTransaction({
			variables: {
				data: {
					...data,
					date: data.date.toISOString(),
				},
			},
			refetchQueries: [{ query: GET_TRANSACTIONS, variables: { page, pageSize } }],
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
		<div className="flex flex-col gap-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl">Transações</h1>
					<h2 className="font-light text-gray-600">
						Gerencie todas as suas transações financeiras
					</h2>
				</div>
				<TransactionFormDialog
					open={createOpen}
					onOpenChange={setCreateOpen}
					categories={categories.map(category => ({ id: category.id, name: category.name }))}
					onSubmit={handleCreateTransaction}
					loading={creatingTransaction}
					serverError={createServerError}
					trigger={
						<Button className="px-4 py-4.5 font-light" size="sm">
							<PlusIcon className="size-4" />
							Nova transação
						</Button>
					}
				/>
			</div>

			<TransactionFilters />
			<TransactionTable
				transactions={transactions}
				totalCount={totalCount}
				page={page}
				pageSize={pageSize}
				loading={loading}
				onPageChange={setPage}
			/>
		</div>
	);
}
