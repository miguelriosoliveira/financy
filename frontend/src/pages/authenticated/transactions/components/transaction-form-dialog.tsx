import { type CreateTransactionInputType, createTransactionSchema } from '@financy/shared';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { type ReactNode, type SubmitEvent, useEffect, useState } from 'react';
import z from 'zod';
import { FormField } from '@/components/form-field';
import { SubmitButton } from '@/components/submit-button';
import { Button as ShadcnButton } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { TransactionTypeSelector, type TransactionTypeValue } from './transaction-type-selector';

const TRANSACTION_FIELD_MESSAGES = {
	amount: 'Informe um valor maior que zero',
	date: 'Selecione a data',
	categoryId: 'Selecione uma categoria',
} as const;

type CategoryOption = {
	id: string;
	name: string;
};

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	categories: CategoryOption[];
	onSubmit: (data: CreateTransactionInputType) => void;
	loading: boolean;
	serverError?: string;
	trigger?: ReactNode;
};

function getDefaultValues() {
	return {
		type: 'EXPENSE' as TransactionTypeValue,
		description: '',
		date: undefined as Date | undefined,
		amount: '',
		categoryId: undefined as string | undefined,
	};
}

export function TransactionFormDialog({
	open,
	onOpenChange,
	categories,
	onSubmit,
	loading,
	serverError,
	trigger,
}: Props) {
	const [type, setType] = useState<TransactionTypeValue>('EXPENSE');
	const [description, setDescription] = useState('');
	const [date, setDate] = useState<Date | undefined>();
	const [amount, setAmount] = useState('');
	const [categoryId, setCategoryId] = useState<string | undefined>();
	const [datePickerOpen, setDatePickerOpen] = useState(false);
	const [errors, setErrors] = useState<Partial<Record<'amount' | 'date' | 'categoryId', string>>>(
		{},
	);

	useEffect(() => {
		if (!open) {
			return;
		}

		const defaults = getDefaultValues();
		setType(defaults.type);
		setDescription(defaults.description);
		setDate(defaults.date);
		setAmount(defaults.amount);
		setCategoryId(defaults.categoryId || undefined);
		setErrors({});
	}, [open]);

	const categoryError = errors.categoryId ?? serverError;

	function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		const result = createTransactionSchema.safeParse({
			amount: amount === '' ? Number.NaN : Number(amount),
			type,
			description: description || undefined,
			date,
			categoryId,
		});

		if (!result.success) {
			const fieldErrors = z.treeifyError(result.error).properties;
			setErrors({
				...(fieldErrors?.amount && { amount: TRANSACTION_FIELD_MESSAGES.amount }),
				...(fieldErrors?.date && { date: TRANSACTION_FIELD_MESSAGES.date }),
				...(fieldErrors?.categoryId && { categoryId: TRANSACTION_FIELD_MESSAGES.categoryId }),
			});
			return;
		}

		setErrors({});
		onSubmit(result.data);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			{trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-base">Nova transação</DialogTitle>
					<DialogDescription className="font-light text-gray-600">
						Registre sua despesa ou receita
					</DialogDescription>
				</DialogHeader>
				<form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
					<TransactionTypeSelector value={type} onChange={setType} />
					<FormField
						label="Descrição"
						id="transaction-description"
						placeholder="Ex. Almoço no restaurante"
						value={description}
						onChange={event => setDescription(event.target.value)}
					/>
					<div className="grid grid-cols-2 gap-4">
						<Field>
							<FieldLabel htmlFor="transaction-date" className="font-normal">
								Data
							</FieldLabel>
							<Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
								<PopoverTrigger asChild>
									<ShadcnButton
										id="transaction-date"
										type="button"
										variant="outline"
										className={cn(
											'h-auto w-full justify-start py-3.5 font-light text-base',
											!date && 'text-gray-400',
										)}
									>
										<CalendarIcon className="size-4 text-gray-400" />
										{date ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione'}
									</ShadcnButton>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={date}
										onSelect={selectedDate => {
											setDate(selectedDate);
											setDatePickerOpen(false);
										}}
										locale={ptBR}
									/>
								</PopoverContent>
							</Popover>
							{errors.date && (
								<FieldDescription className="text-xs">{errors.date}</FieldDescription>
							)}
						</Field>
						<FormField
							label="Valor"
							id="transaction-amount"
							type="number"
							min="0"
							step="0.01"
							placeholder="0,00"
							icon={<span className="text-gray-700">R$</span>}
							value={amount}
							onChange={event => setAmount(event.target.value)}
							error={errors.amount}
						/>
					</div>
					<Field>
						<FieldLabel htmlFor="transaction-category" className="font-normal">
							Categoria
						</FieldLabel>
						<Select value={categoryId ?? ''} onValueChange={setCategoryId}>
							<SelectTrigger
								id="transaction-category"
								className="h-auto w-full py-3.5 font-light text-base data-placeholder:text-gray-400"
							>
								<SelectValue placeholder="Selecione" />
							</SelectTrigger>
							<SelectContent>
								{categories.map(category => (
									<SelectItem key={category.id} value={category.id}>
										{category.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{categoryError && (
							<FieldDescription className="text-xs">{categoryError}</FieldDescription>
						)}
					</Field>
					<SubmitButton text="Salvar" loading={loading} />
				</form>
			</DialogContent>
		</Dialog>
	);
}
