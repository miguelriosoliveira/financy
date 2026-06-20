import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

type Props = {
	icon: ReactNode;
	title: string;
	value: string;
};

export function HeaderCard({ icon, title, value }: Props) {
	return (
		<Card>
			<CardContent className="flex items-baseline gap-4">
				{icon}
				<div className="flex flex-col gap-2">
					<span className="font-bold text-3xl">{value}</span>
					<span className="font-normal text-gray-500 text-xs uppercase">{title}</span>
				</div>
			</CardContent>
		</Card>
	);
}
