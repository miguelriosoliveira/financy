import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { tv } from 'tailwind-variants';
import { resolveFieldState } from '@/components/field-state';
import { InputGroup, InputGroupAddon } from '@/components/input-group';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const dateField = tv({
	slots: {
		field: 'gap-2',
		label: 'font-medium text-gray-700 text-sm',
		inputGroup: 'h-(--input-height)',
		addon: 'text-gray-400',
		trigger:
			'flex-1 bg-transparent px-0 py-[15px] text-left text-base outline-none focus-visible:ring-0',
		helper: 'text-gray-500 text-xs',
	},
	variants: {
		state: {
			empty: {
				trigger: 'font-normal text-gray-400',
			},
			active: {
				label: 'text-brand-base',
				addon: 'text-brand-base',
				trigger: 'font-normal text-gray-800',
			},
			filled: {
				addon: 'text-gray-800',
				trigger: 'font-normal text-gray-800',
			},
			error: {
				label: 'text-danger',
				addon: 'text-danger',
				trigger: 'font-normal text-gray-800',
			},
			disabled: {
				inputGroup: 'opacity-50',
			},
		},
	},
	defaultVariants: {
		state: 'empty',
	},
});

type DateFieldProps = {
	label: string;
	id: string;
	value: Date | undefined;
	onChange: (date: Date | undefined) => void;
	error?: string;
	placeholder?: string;
	disabled?: boolean;
};

export function DateField({
	label,
	id,
	value,
	onChange,
	error,
	placeholder = 'Selecione',
	disabled,
}: DateFieldProps) {
	const [focused, setFocused] = useState(false);
	const [open, setOpen] = useState(false);
	const hasValue = value !== undefined;
	const state = resolveFieldState({
		disabled,
		error,
		focused: focused || open,
		hasValue,
	});
	const styles = dateField({ state });

	return (
		<Field className={styles.field()} data-invalid={error ? true : undefined}>
			<FieldLabel htmlFor={id} className={styles.label()}>
				{label}
			</FieldLabel>

			<Popover
				open={open}
				onOpenChange={nextOpen => {
					setOpen(nextOpen);
					if (!nextOpen) {
						setFocused(false);
					}
				}}
			>
				<InputGroup className={styles.inputGroup()} data-disabled={disabled ? true : undefined}>
					<InputGroupAddon className={styles.addon()}>
						<CalendarIcon className="size-4" />
					</InputGroupAddon>

					<PopoverTrigger asChild>
						<button
							id={id}
							type="button"
							disabled={disabled}
							aria-invalid={error ? true : undefined}
							className={cn(styles.trigger())}
							onFocus={() => setFocused(true)}
							onBlur={() => {
								if (!open) {
									setFocused(false);
								}
							}}
						>
							{hasValue ? format(value, 'dd/MM/yyyy', { locale: ptBR }) : placeholder}
						</button>
					</PopoverTrigger>
				</InputGroup>

				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={value}
						onSelect={selectedDate => {
							onChange(selectedDate);
							setOpen(false);
							setFocused(false);
						}}
						locale={ptBR}
					/>
				</PopoverContent>
			</Popover>

			{error && <FieldDescription className={styles.helper()}>{error}</FieldDescription>}
		</Field>
	);
}
