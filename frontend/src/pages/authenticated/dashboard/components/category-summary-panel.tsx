import { ChevronRightIcon } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/button';
import { Tag } from '@/components/tag';
import type { CategoryRow } from '@/hooks/use-categories';
import { formatCurrency } from '@/lib/format-currency';
import { cn } from '@/lib/utils';

const CATEGORY_SUMMARY_MAX_BODY_HEIGHT = 'max-h-118';

function formatTransactionCount(count: number) {
	return `${count} ${count === 1 ? 'item' : 'itens'}`;
}

type CategorySummaryPanelProps = {
	categories: CategoryRow[];
	loading: boolean;
	className?: string;
};

export function CategorySummaryPanel({
	categories,
	loading,
	className,
}: CategorySummaryPanelProps) {
	const sortedCategories = useMemo(
		() => [...categories].sort((a, b) => (b.totalAmount ?? 0) - (a.totalAmount ?? 0)),
		[categories],
	);

	return (
		<div
			className={cn(
				'self-start overflow-hidden rounded-xl border border-gray-300 bg-white',
				className,
			)}
			data-testid="category-summary-panel"
		>
			<table className="w-full text-sm">
				<thead className="border-gray-300 border-b font-normal text-gray-500 text-xs uppercase">
					<tr>
						<th className="w-full px-6 py-4 text-left">Categorias</th>
						<th className="px-6 py-4" />
						<th className="whitespace-nowrap py-4 text-right">
							<Button color="link" size="sm">
								<Link to="/categories" className="flex items-center gap-2">
									Gerenciar
									<ChevronRightIcon className="size-5" />
								</Link>
							</Button>
						</th>
					</tr>
				</thead>
			</table>
			<div className={cn('overflow-y-auto', CATEGORY_SUMMARY_MAX_BODY_HEIGHT)}>
				<table className="w-full text-sm">
					<tbody className="font-light text-gray-600">
						{loading ? (
							<tr>
								<td colSpan={3} className="px-6 py-4">
									Carregando categorias...
								</td>
							</tr>
						) : sortedCategories.length === 0 ? (
							<tr>
								<td colSpan={3} className="px-6 py-4">
									Nenhuma categoria ainda
								</td>
							</tr>
						) : (
							sortedCategories.map(category => (
								<tr key={category.id} data-testid={`category-summary-row-${category.id}`}>
									<td className="w-full max-w-0 px-6 py-4 text-left">
										<Tag color={category.color}>{category.name}</Tag>
									</td>
									<td className="whitespace-nowrap px-6 py-4 text-right">
										{formatTransactionCount(category.transactionCount ?? 0)}
									</td>
									<td className="whitespace-nowrap px-6 py-4 text-right">
										<span className="font-semibold text-gray-800">
											{formatCurrency(category.totalAmount ?? 0)}
										</span>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
