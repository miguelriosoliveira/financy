import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

export const GET_TRANSACTION_PERIODS = gql`
	query GetTransactionPeriods {
		getTransactionPeriods {
			year
			month
		}
	}
`;

export type TransactionPeriod = {
	year: number;
	month: number;
};

export type GetTransactionPeriodsResult = {
	getTransactionPeriods: TransactionPeriod[];
};

export function useTransactionPeriods() {
	const { data, loading } = useQuery<GetTransactionPeriodsResult>(GET_TRANSACTION_PERIODS);

	return {
		periods: data?.getTransactionPeriods ?? [],
		loading,
	};
}
