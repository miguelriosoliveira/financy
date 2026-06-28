import { createCategorySchema, type UpdateCategoryInputType } from '@financy/shared';
import { type ReactNode, type SubmitEvent, useEffect, useState } from 'react';
import z from 'zod';
import { FormField } from '@/components/form-field';
import { SubmitButton } from '@/components/submit-button';
import type { TagColor } from '@/components/tag';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import type { CategoryType } from './category-icon';
import { ColorSelector } from './color-selector';
import { IconSelector } from './icon-selector';

const DEFAULT_ICON: CategoryType = 'salary';
const DEFAULT_COLOR: TagColor = 'green';

const CATEGORY_FIELD_MESSAGES: Record<'name', string> = {
	name: 'Informe o título da categoria',
};

export type CategoryFormValues = {
	name: string;
	description: string;
	icon: CategoryType;
	color: TagColor;
};

type Props = {
	mode: 'create' | 'edit';
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialValues?: CategoryFormValues;
	onSubmit: (data: UpdateCategoryInputType) => void;
	loading: boolean;
	serverError?: string;
	trigger?: ReactNode;
};

const DIALOG_COPY = {
	create: {
		title: 'Nova categoria',
		description: 'Organize suas transações com categorias',
	},
	edit: {
		title: 'Editar categoria',
		description: 'Atualize os dados da categoria',
	},
} as const;

function getDefaultValues(): CategoryFormValues {
	return {
		name: '',
		description: '',
		icon: DEFAULT_ICON,
		color: DEFAULT_COLOR,
	};
}

export function CategoryFormDialog({
	mode,
	open,
	onOpenChange,
	initialValues,
	onSubmit,
	loading,
	serverError,
	trigger,
}: Props) {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [icon, setIcon] = useState<CategoryType>(DEFAULT_ICON);
	const [color, setColor] = useState<TagColor>(DEFAULT_COLOR);
	const [errors, setErrors] = useState<Partial<Record<'name', string>>>({});

	useEffect(() => {
		if (!open) {
			return;
		}

		const values = mode === 'edit' && initialValues ? initialValues : getDefaultValues();
		setName(values.name);
		setDescription(values.description);
		setIcon(values.icon);
		setColor(values.color);
		setErrors({});
	}, [open, mode, initialValues]);

	const copy = DIALOG_COPY[mode];
	const nameError = errors.name ?? serverError;

	function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		const schema = createCategorySchema;
		const result = schema.safeParse({ name, description, icon, color });
		if (!result.success) {
			const fieldErrors = z.treeifyError(result.error).properties;
			setErrors({
				...(fieldErrors?.name && { name: CATEGORY_FIELD_MESSAGES.name }),
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
					<FormField
						label="Título"
						id={`${mode}-title`}
						placeholder="Ex. Alimentação"
						value={name}
						onChange={e => setName(e.target.value)}
						error={nameError}
					/>
					<FormField
						label="Descrição"
						id={`${mode}-description`}
						placeholder="Descrição da categoria"
						value={description}
						onChange={e => setDescription(e.target.value)}
					/>
					<IconSelector value={icon} onChange={setIcon} />
					<ColorSelector value={color} onChange={setColor} />
					<SubmitButton text="Salvar" loading={loading} />
				</form>
			</DialogContent>
		</Dialog>
	);
}
