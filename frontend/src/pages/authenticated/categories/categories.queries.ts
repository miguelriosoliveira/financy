import { gql } from '@apollo/client';

export const GET_CATEGORIES_SUMMARY = gql`
	query GetCategoriesSummary {
		getCategoriesSummary {
			transactionCount
			mostUsedCategory {
				id
				name
				transactionCount
			}
		}
	}
`;
