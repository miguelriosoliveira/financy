import { type CreateTransactionInputType, createTransactionSchema } from '@financy/shared';
import { type ReactNode, type SubmitEvent, useEffect, useState } from 'react';
import z from 'zod';
import { DateField } from '@/components/date-field';
import { FormField } from '@/components/form-field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { SubmitButton } from '@/components/submit-button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
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

export type TransactionFormValues = {
	type: TransactionTypeValue;
	description: string;
	date: Date | undefined;
	amount: string;
	categoryId: string | undefined;
};

type Props = {
	mode: 'create' | 'edit';
	open: boolean;
	onOpenChange: (open: boolean) => void;
	categories: CategoryOption[];
	initialValues?: TransactionFormValues;
	onSubmit: (data: CreateTransactionInputType) => void;
	loading: boolean;
	serverError?: string;
	trigger?: ReactNode;
};

const DIALOG_COPY = {
	create: {
		title: 'Nova transação',
		description: 'Registre sua despesa ou receita',
	},
	edit: {
		title: 'Editar transação',
		description: 'Atualize os dados da transação',
	},
} as const;

function getDefaultValues(): TransactionFormValues {
	return {
		type: 'EXPENSE',
		description: '',
		date: undefined,
		amount: '',
		categoryId: undefined,
	};
}

export function TransactionFormDialog({
	mode,
	open,
	onOpenChange,
	categories,
	initialValues,
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
	const [errors, setErrors] = useState<Partial<Record<'amount' | 'date' | 'categoryId', string>>>(
		{},
	);

	useEffect(() => {
		if (!open) {
			return;
		}

		const values = mode === 'edit' && initialValues ? initialValues : getDefaultValues();
		setType(values.type);
		setDescription(values.description);
		setDate(values.date);
		setAmount(values.amount);
		setCategoryId(values.categoryId || undefined);
		setErrors({});
	}, [open, mode, initialValues]);

	const copy = DIALOG_COPY[mode];
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
					<DialogTitle className="text-base">{copy.title}</DialogTitle>
					<DialogDescription className="font-light text-gray-600">
						{copy.description}
					</DialogDescription>
				</DialogHeader>
				<form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
					<TransactionTypeSelector value={type} onChange={setType} />
					<FormField
						label="Descrição"
						id={`${mode}-transaction-description`}
						placeholder="Ex. Almoço no restaurante"
						value={description}
						onChange={event => setDescription(event.target.value)}
					/>
					<div className="grid grid-cols-2 gap-4">
						<DateField
							label="Data"
							id={`${mode}-transaction-date`}
							value={date}
							onChange={setDate}
							error={errors.date}
						/>
						<FormField
							label="Valor"
							id={`${mode}-transaction-amount`}
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
						<FieldLabel htmlFor={`${mode}-transaction-category`} className="font-normal">
							Categoria
						</FieldLabel>
						<Select value={categoryId ?? ''} onValueChange={setCategoryId}>
							<SelectTrigger
								id={`${mode}-transaction-category`}
								className="w-full font-light data-placeholder:text-gray-400"
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
