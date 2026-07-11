import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import type { TagColor } from '@/components/tag';
import type { CategoryType } from '@/pages/authenticated/categories/components/category-icon';

export const DEFAULT_TRANSACTION_PAGE_SIZE = 10;

export const GET_TRANSACTIONS = gql`
	query GetTransactions($page: Int!, $pageSize: Int!) {
		getTransactions(page: $page, pageSize: $pageSize) {
			items {
				id
				amount
				type
				description
				date
				category {
					id
					name
					icon
					color
				}
			}
			totalCount
			page
			pageSize
		}
	}
`;

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

export type TransactionCategoryRow = {
	id: string;
	name: string;
	icon: CategoryType;
	color: TagColor;
};

export type TransactionRow = {
	id: string;
	amount: number;
	type: 'INCOME' | 'EXPENSE';
	description: string | null;
	date: string;
	category: TransactionCategoryRow;
};

export type GetTransactionsResult = {
	getTransactions: {
		items: TransactionRow[];
		totalCount: number;
		page: number;
		pageSize: number;
	};
};

type UseTransactionsOptions = {
	page: number;
	pageSize?: number;
};

export function useTransactions({
	page,
	pageSize = DEFAULT_TRANSACTION_PAGE_SIZE,
}: UseTransactionsOptions) {
	const { data, loading } = useQuery<GetTransactionsResult>(GET_TRANSACTIONS, {
		variables: { page, pageSize },
	});

	return {
		transactions: data?.getTransactions.items ?? [],
		totalCount: data?.getTransactions.totalCount ?? 0,
		page: data?.getTransactions.page ?? page,
		pageSize: data?.getTransactions.pageSize ?? pageSize,
		loading,
	};
}

export function useCreateTransaction() {
	return useMutation(CREATE_TRANSACTION);
}
