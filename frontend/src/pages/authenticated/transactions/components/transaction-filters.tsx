import { SearchIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { FormField } from '@/components/form-field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import type { TransactionPeriod } from '@/hooks/use-transaction-periods';
import {
	DEFAULT_TRANSACTION_FILTERS,
	encodePeriodValue,
	formatPeriodLabel,
	type TransactionFiltersState,
} from '../transaction-filters.state';

const SEARCH_DEBOUNCE_MS = 300;

type CategoryOption = {
	id: string;
	name: string;
};

type TransactionFiltersProps = {
	value?: TransactionFiltersState;
	onChange: (value: TransactionFiltersState) => void;
	categories: CategoryOption[];
	periods: TransactionPeriod[];
	periodsLoading?: boolean;
	className?: string;
};

export function TransactionFilters({
	value = DEFAULT_TRANSACTION_FILTERS,
	onChange,
	categories,
	periods,
	periodsLoading = false,
	className,
}: TransactionFiltersProps) {
	const [searchDraft, setSearchDraft] = useState(value.search);
	const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		setSearchDraft(value.search);
	}, [value.search]);

	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, []);

	function applySearch(search: string) {
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
			debounceTimerRef.current = null;
		}

		const trimmedSearch = search.trim();
		if (trimmedSearch === value.search) {
			return;
		}

		onChange({ ...value, search: trimmedSearch });
	}

	function scheduleSearch(search: string) {
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		debounceTimerRef.current = setTimeout(() => {
			applySearch(search);
		}, SEARCH_DEBOUNCE_MS);
	}

	function handleSearchChange(nextSearch: string) {
		setSearchDraft(nextSearch);
		scheduleSearch(nextSearch);
	}

	function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.key !== 'Enter') {
			return;
		}

		event.preventDefault();
		applySearch(searchDraft);
	}

	return (
		<div
			className={`grid grid-cols-4 gap-4 rounded-xl border border-gray-300 bg-white p-4 ${className ?? ''}`}
			data-testid="transaction-filters"
		>
			<FormField
				size="sm"
				label="Buscar"
				id="transaction-search"
				placeholder="Buscar por descrição"
				icon={<SearchIcon className="size-4" />}
				value={searchDraft}
				onChange={event => handleSearchChange(event.target.value)}
				onKeyDown={handleSearchKeyDown}
			/>
			<FieldSelect
				label="Tipo"
				id="transaction-filter-type"
				value={value.type}
				onValueChange={nextType =>
					onChange({ ...value, type: nextType as TransactionFiltersState['type'] })
				}
			>
				<SelectItem value="all">Todos</SelectItem>
				<SelectItem value="EXPENSE">Saída</SelectItem>
				<SelectItem value="INCOME">Entrada</SelectItem>
			</FieldSelect>
			<FieldSelect
				label="Categoria"
				id="transaction-filter-category"
				value={value.categoryId}
				onValueChange={nextCategoryId => onChange({ ...value, categoryId: nextCategoryId })}
			>
				<SelectItem value="all">Todas</SelectItem>
				{categories.map(category => (
					<SelectItem key={category.id} value={category.id}>
						{category.name}
					</SelectItem>
				))}
			</FieldSelect>
			<FieldSelect
				label="Período"
				id="transaction-filter-period"
				value={value.period}
				disabled={periodsLoading}
				onValueChange={nextPeriod => onChange({ ...value, period: nextPeriod })}
			>
				<SelectItem value="all">Todos os períodos</SelectItem>
				{periods.map(period => {
					const periodValue = encodePeriodValue(period.year, period.month);
					return (
						<SelectItem key={periodValue} value={periodValue}>
							{formatPeriodLabel(period.year, period.month)}
						</SelectItem>
					);
				})}
			</FieldSelect>
		</div>
	);
}

type FieldSelectProps = {
	label: string;
	id: string;
	value: string;
	disabled?: boolean;
	onValueChange: (value: string) => void;
	children: React.ReactNode;
};

function FieldSelect({
	label,
	id,
	value,
	disabled = false,
	onValueChange,
	children,
}: FieldSelectProps) {
	return (
		<div className="flex flex-col gap-2">
			<label htmlFor={id} className="font-medium text-gray-700 text-sm">
				{label}
			</label>
			<Select value={value} onValueChange={onValueChange} disabled={disabled}>
				<SelectTrigger id={id} size="sm" className="w-full font-light">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>{children}</SelectContent>
			</Select>
		</div>
	);
}
