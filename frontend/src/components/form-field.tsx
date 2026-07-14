import { type ComponentProps, useState } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { resolveFieldState } from '@/components/field-state';
import { cn } from '@/lib/utils';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from './input-group';
import { Field, FieldDescription, FieldLabel } from './ui/field';

const formField = tv({
	slots: {
		field: 'gap-2',
		label: 'font-medium text-gray-700 text-sm',
		inputGroup: '',
		input: '',
		addon: 'text-gray-400',
		rightAddon: 'text-gray-400',
		helper: 'text-gray-500 text-xs',
	},
	variants: {
		size: {
			default: {
				inputGroup: 'h-(--input-height)',
				input: 'py-[15px]',
			},
			sm: {
				field: 'gap-2',
				label: 'text-sm',
				inputGroup: 'h-9 px-3 py-0',
				input: 'h-full min-h-0 py-0 font-light text-base leading-normal',
				addon: 'py-0',
				rightAddon: 'py-0',
			},
		},
		state: {
			empty: {},
			active: {
				label: 'text-brand-base',
				addon: 'text-brand-base',
				rightAddon: 'text-gray-400',
			},
			filled: {
				addon: 'text-gray-800',
				rightAddon: 'text-gray-700',
			},
			error: {
				label: 'text-danger',
				addon: 'text-danger',
				rightAddon: 'text-danger',
			},
			disabled: {
				inputGroup: 'opacity-50',
			},
		},
	},
	defaultVariants: {
		size: 'default',
		state: 'empty',
	},
});

type Props = Omit<ComponentProps<typeof InputGroupInput>, 'size'> &
	VariantProps<typeof formField> & {
		label: string;
		error?: string;
		icon?: React.ReactNode;
		rightIcon?: React.ReactNode;
		rightIconClick?: () => void;
	};

export function FormField({
	label,
	error,
	icon,
	rightIcon,
	rightIconClick,
	size,
	value,
	disabled,
	onFocus,
	onBlur,
	...inputProps
}: Props) {
	const [focused, setFocused] = useState(false);
	const hasValue = String(value ?? '').length > 0;
	const state = resolveFieldState({
		disabled,
		error,
		focused,
		hasValue,
	});
	const styles = formField({ size, state });

	return (
		<Field className={styles.field()} data-invalid={error ? true : undefined}>
			<FieldLabel htmlFor={inputProps.id} className={styles.label()}>
				{label}
			</FieldLabel>

			<InputGroup className={styles.inputGroup()} data-disabled={disabled ? true : undefined}>
				{icon && <InputGroupAddon className={cn(styles.addon())}>{icon}</InputGroupAddon>}

				<InputGroupInput
					{...inputProps}
					value={value}
					disabled={disabled}
					aria-invalid={error ? true : undefined}
					className={cn(styles.input(), inputProps.className)}
					onFocus={event => {
						setFocused(true);
						onFocus?.(event);
					}}
					onBlur={event => {
						setFocused(false);
						onBlur?.(event);
					}}
				/>

				{rightIcon && (
					<InputGroupAddon align="inline-end">
						<InputGroupButton className={styles.rightAddon()} onClick={rightIconClick}>
							{rightIcon}
						</InputGroupButton>
					</InputGroupAddon>
				)}
			</InputGroup>

			{error && <FieldDescription className={styles.helper()}>{error}</FieldDescription>}
		</Field>
	);
}
