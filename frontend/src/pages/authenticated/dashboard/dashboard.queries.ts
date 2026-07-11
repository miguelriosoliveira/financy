import { gql } from '@apollo/client';

export const GET_DASHBOARD_SUMMARY = gql`
	query GetDashboardSummary {
		getDashboardSummary {
			totalBalance
			monthlyIncome
			monthlyExpenses
		}
	}
`;
