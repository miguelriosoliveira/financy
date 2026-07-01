import { ArrowDownCircleIcon, ArrowUpCircleIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { OptionSelector } from '@/components/option-selector';

export type TransactionTypeValue = 'INCOME' | 'EXPENSE';

type Props = {
	value: TransactionTypeValue;
	onChange: (value: TransactionTypeValue) => void;
};

const TYPE_OPTIONS: Array<{
	value: TransactionTypeValue;
	label: string;
	render: ReactNode;
}> = [
	{
		value: 'EXPENSE',
		label: 'Despesa',
		render: (
			<div className="flex items-center gap-2 px-2">
				<ArrowDownCircleIcon className="size-[18px] text-red-base" />
				<span className="text-sm">Despesa</span>
			</div>
		),
	},
	{
		value: 'INCOME',
		label: 'Receita',
		render: (
			<div className="flex items-center gap-2 px-2">
				<ArrowUpCircleIcon className="size-[18px] text-green-base" />
				<span className="text-sm">Receita</span>
			</div>
		),
	},
];

export function TransactionTypeSelector({ value, onChange }: Props) {
	return (
		<OptionSelector
			label="Tipo"
			value={value}
			onChange={onChange}
			className="grid-cols-2"
			itemClassName="aspect-auto h-auto w-full justify-start px-0 py-3"
			options={TYPE_OPTIONS}
		/>
	);
}
