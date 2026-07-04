import type { ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import { Field, FieldDescription, FieldLabel } from './ui/field';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from './ui/input-group';

const formField = tv({
	slots: {
		field: '',
		label: 'font-normal',
		inputGroup: 'h-auto px-1',
		input: 'h-auto placeholder:font-light placeholder:text-gray-400',
		addon: '',
	},
	variants: {
		size: {
			default: {
				input: 'py-3.5 placeholder:text-base',
			},
			sm: {
				field: 'gap-2',
				label: 'text-sm',
				inputGroup: 'h-9 w-full px-1 py-0',
				input: 'h-full min-h-0 py-0 font-light text-base leading-normal placeholder:text-base',
				addon: 'py-0',
			},
		},
	},
	defaultVariants: {
		size: 'default',
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
	...inputProps
}: Props) {
	const styles = formField({ size });

	return (
		<Field className={styles.field()}>
			<FieldLabel htmlFor={inputProps.id} className={styles.label()}>
				{label}
			</FieldLabel>

			<InputGroup className={styles.inputGroup()}>
				{icon && (
					<InputGroupAddon className={cn('text-gray-400', styles.addon())}>{icon}</InputGroupAddon>
				)}

				<InputGroupInput {...inputProps} className={cn(styles.input(), inputProps.className)} />

				{rightIcon && (
					<InputGroupAddon align="inline-end" className={styles.addon()}>
						<InputGroupButton className="text-gray-700" onClick={rightIconClick}>
							{rightIcon}
						</InputGroupButton>
					</InputGroupAddon>
				)}
			</InputGroup>

			{error && <FieldDescription className="text-xs">{error}</FieldDescription>}
		</Field>
	);
}
