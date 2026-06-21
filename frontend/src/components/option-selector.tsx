import { RadioGroup as RadioGroupRadix } from 'radix-ui';
import type { ReactNode } from 'react';
import { Field, FieldLabel } from '@/components/ui/field';
import { cn } from '@/lib/utils';

export type SelectorOption<T extends string> = {
	value: T;
	label: string;
	render: ReactNode;
};

type Props<T extends string> = {
	label: string;
	value: T;
	onChange: (value: T) => void;
	options: SelectorOption<T>[];
	className?: string;
	itemClassName?: string;
};

export function OptionSelector<T extends string>({
	label,
	value,
	onChange,
	options,
	className,
	itemClassName,
}: Props<T>) {
	return (
		<Field>
			<FieldLabel>{label}</FieldLabel>
			<RadioGroupRadix.Root
				value={value}
				onValueChange={nextValue => onChange(nextValue as T)}
				className={cn('grid grid-cols-8 gap-2', className)}
			>
				{options.map(option => (
					<RadioGroupRadix.Item
						key={option.value}
						value={option.value}
						aria-label={option.label}
						className={cn(
							'flex aspect-square items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 outline-none focus-visible:ring-2 focus-visible:ring-brand-base data-checked:border-brand-base',
							itemClassName,
						)}
					>
						{option.render}
					</RadioGroupRadix.Item>
				))}
			</RadioGroupRadix.Root>
		</Field>
	);
}
