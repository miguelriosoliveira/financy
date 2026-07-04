import { SearchIcon } from 'lucide-react';
import { FormField } from '@/components/form-field';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

type FilterProps = {
	className?: string;
};

export function TransactionFilters({ className }: FilterProps) {
	return (
		<div
			className={`grid grid-cols-4 gap-4 rounded-xl border border-gray-300 bg-white p-4 ${className ?? ''}`}
		>
			<FormField
				size="sm"
				label="Buscar"
				id="transaction-search"
				placeholder="Buscar por descrição"
				icon={<SearchIcon className="size-4" />}
			/>
			<FieldSelect label="Tipo" id="transaction-filter-type" defaultValue="all">
				<SelectItem value="all">Todos</SelectItem>
				<SelectItem value="expense">Saída</SelectItem>
				<SelectItem value="income">Entrada</SelectItem>
			</FieldSelect>
			<FieldSelect label="Categoria" id="transaction-filter-category" defaultValue="all">
				<SelectItem value="all">Todas</SelectItem>
			</FieldSelect>
			<FieldSelect label="Período" id="transaction-filter-period" defaultValue="nov-2025">
				<SelectItem value="nov-2025">Novembro / 2025</SelectItem>
			</FieldSelect>
		</div>
	);
}

type FieldSelectProps = {
	label: string;
	id: string;
	defaultValue: string;
	children: React.ReactNode;
};

function FieldSelect({ label, id, defaultValue, children }: FieldSelectProps) {
	return (
		<div className="flex flex-col gap-2">
			<label htmlFor={id} className="font-normal text-sm">
				{label}
			</label>
			<Select defaultValue={defaultValue}>
				<SelectTrigger id={id} className="h-10 w-full py-0 font-light text-base">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>{children}</SelectContent>
			</Select>
		</div>
	);
}
