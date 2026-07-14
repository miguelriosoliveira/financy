import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { Select as SelectPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import {
	Select as ShadcnSelect,
	SelectContent as ShadcnSelectContent,
	SelectGroup as ShadcnSelectGroup,
	SelectItem as ShadcnSelectItem,
	SelectLabel as ShadcnSelectLabel,
	SelectScrollDownButton as ShadcnSelectScrollDownButton,
	SelectScrollUpButton as ShadcnSelectScrollUpButton,
	SelectSeparator as ShadcnSelectSeparator,
	SelectValue as ShadcnSelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export const Select = ShadcnSelect;
export const SelectGroup = ShadcnSelectGroup;
export const SelectValue = ShadcnSelectValue;
export const SelectLabel = ShadcnSelectLabel;
export const SelectSeparator = ShadcnSelectSeparator;
export const SelectScrollUpButton = ShadcnSelectScrollUpButton;
export const SelectScrollDownButton = ShadcnSelectScrollDownButton;

export function SelectTrigger({
	className,
	size = 'default',
	children,
	...props
}: ComponentProps<typeof SelectPrimitive.Trigger> & {
	size?: 'sm' | 'default';
}) {
	return (
		<SelectPrimitive.Trigger
			data-slot="select-trigger"
			data-size={size}
			className={cn(
				'group/select-trigger flex w-full items-center justify-between gap-3 whitespace-nowrap rounded-lg border border-gray-300 bg-white px-3.5 py-[15px] text-base shadow-none outline-none transition-colors',
				'focus-visible:border-gray-300 focus-visible:ring-0',
				'disabled:cursor-not-allowed disabled:opacity-50',
				'aria-invalid:border-gray-300 aria-invalid:ring-0',
				'data-placeholder:text-gray-400',
				'data-[size=default]:h-(--input-height) data-[size=sm]:h-9',
				'*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-3 *:data-[slot=select-value]:text-gray-800',
				"[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className,
			)}
			{...props}
		>
			{children}
			<ChevronDownIcon className="pointer-events-none size-4 text-gray-700 group-data-[state=open]/select-trigger:hidden" />
			<ChevronUpIcon className="pointer-events-none hidden size-4 text-gray-700 group-data-[state=open]/select-trigger:block" />
		</SelectPrimitive.Trigger>
	);
}

export function SelectContent({ className, ...props }: ComponentProps<typeof ShadcnSelectContent>) {
	return (
		<ShadcnSelectContent
			className={cn(
				'rounded-lg border border-gray-300 bg-white text-gray-800 shadow-[0_4px_7.5px_rgba(0,0,0,0.1)] ring-0',
				'**:data-position:flex **:data-position:flex-col **:data-position:gap-4 **:data-position:p-3.5',
				className,
			)}
			{...props}
		/>
	);
}

export function SelectItem({ className, ...props }: ComponentProps<typeof ShadcnSelectItem>) {
	return (
		<ShadcnSelectItem
			className={cn(
				'py-0 text-base text-gray-800 focus:bg-transparent data-[state=checked]:font-medium',
				'[&_span]:right-0 [&_span]:size-5 [&_svg]:size-5 [&_svg]:text-success',
				className,
			)}
			{...props}
		/>
	);
}
