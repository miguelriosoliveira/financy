import { useQuery } from '@apollo/client/react';
import { CircleArrowDownIcon, CircleArrowUpIcon, WalletIcon } from 'lucide-react';
import { useCategories } from '@/hooks/use-categories';
import { formatCurrency } from '@/lib/format-currency';
import { CategorySummaryPanel } from './components/category-summary-panel';
import { DashboardSummaryCard } from './components/dashboard-summary-card';
import { RecentTransactionsTable } from './components/recent-transactions-table';
import { GET_DASHBOARD_SUMMARY } from './dashboard.queries';

export { GET_DASHBOARD_SUMMARY } from './dashboard.queries';

type GetDashboardSummaryResult = {
	getDashboardSummary: {
		totalBalance: number;
		monthlyIncome: number;
		monthlyExpenses: number;
	};
};

export function DashboardPage() {
	const { data, loading } = useQuery<GetDashboardSummaryResult>(GET_DASHBOARD_SUMMARY);
	const { categories, loading: categoriesLoading } = useCategories({ includeStats: true });

	const summary = data?.getDashboardSummary;
	const categoryOptions = categories.map(category => ({ id: category.id, name: category.name }));

	return (
		<div className="flex flex-col gap-8" data-testid="dashboard-page">
			{loading || !summary ? (
				<p className="font-light text-gray-600">Carregando resumo...</p>
			) : (
				<div className="grid grid-cols-3 gap-6" data-testid="dashboard-summary-cards">
					<DashboardSummaryCard
						icon={<WalletIcon size={20} className="text-purple-base" />}
						title="Saldo total"
						value={formatCurrency(summary.totalBalance)}
					/>
					<DashboardSummaryCard
						icon={<CircleArrowUpIcon size={20} className="text-brand-base" />}
						title="Receitas do mês"
						value={formatCurrency(summary.monthlyIncome)}
					/>
					<DashboardSummaryCard
						icon={<CircleArrowDownIcon size={20} className="text-red-base" />}
						title="Despesas do mês"
						value={formatCurrency(summary.monthlyExpenses)}
					/>
				</div>
			)}

			<div className="grid grid-cols-3 gap-6">
				<RecentTransactionsTable className="col-span-2" categoryOptions={categoryOptions} />
				<CategorySummaryPanel categories={categories} loading={categoriesLoading} />
			</div>
		</div>
	);
}
