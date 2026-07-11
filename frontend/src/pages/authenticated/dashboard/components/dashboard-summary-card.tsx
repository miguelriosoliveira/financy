import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

type Props = {
	icon: ReactNode;
	title: string;
	value: string;
};

export function DashboardSummaryCard({ icon, title, value }: Props) {
	return (
		<Card>
			<CardContent className="flex flex-col gap-4">
				<div className="flex items-center gap-2">
					{icon}
					<span className="font-medium text-gray-500 text-xs uppercase">{title}</span>
				</div>
				<span className="font-bold text-3xl">{value}</span>
			</CardContent>
		</Card>
	);
}
