import type { ComponentProps } from 'react';
import {
	InputGroup as ShadcnInputGroup,
	InputGroupAddon as ShadcnInputGroupAddon,
	InputGroupButton as ShadcnInputGroupButton,
	InputGroupInput as ShadcnInputGroupInput,
	InputGroupText as ShadcnInputGroupText,
	InputGroupTextarea as ShadcnInputGroupTextarea,
} from '@/components/ui/input-group';
import { cn } from '@/lib/utils';

export function InputGroup({ className, ...props }: ComponentProps<typeof ShadcnInputGroup>) {
	return (
		<ShadcnInputGroup
			className={cn(
				'h-(--input-height) gap-3 rounded-lg border-gray-300 bg-white px-3.5 shadow-none transition-colors',
				'has-[[data-slot=input-group-control]:focus-visible]:border-gray-300 has-[[data-slot=input-group-control]:focus-visible]:ring-0',
				'has-[[data-slot][aria-invalid=true]]:border-gray-300 has-[[data-slot][aria-invalid=true]]:ring-0',
				'has-[>[data-align=inline-end]]:[&>input]:pr-0 has-[>[data-align=inline-start]]:[&>input]:pl-0',
				className,
			)}
			{...props}
		/>
	);
}

export function InputGroupAddon({
	className,
	align = 'inline-start',
	...props
}: ComponentProps<typeof ShadcnInputGroupAddon>) {
	return (
		<ShadcnInputGroupAddon
			align={align}
			className={cn(
				'text-base text-gray-400',
				align === 'inline-start' && 'pl-0',
				align === 'inline-end' && 'pr-0',
				className,
			)}
			{...props}
		/>
	);
}

export function InputGroupButton({
	className,
	...props
}: ComponentProps<typeof ShadcnInputGroupButton>) {
	return <ShadcnInputGroupButton className={className} {...props} />;
}

export function InputGroupText({
	className,
	...props
}: ComponentProps<typeof ShadcnInputGroupText>) {
	return <ShadcnInputGroupText className={cn('text-base text-gray-400', className)} {...props} />;
}

export function InputGroupInput({
	className,
	...props
}: ComponentProps<typeof ShadcnInputGroupInput>) {
	return (
		<ShadcnInputGroupInput
			className={cn(
				'px-0 py-[15px] text-base text-gray-800 caret-brand-base shadow-none',
				'placeholder:font-normal placeholder:text-gray-400',
				'focus-visible:border-transparent focus-visible:ring-0',
				'disabled:text-black aria-invalid:border-transparent aria-invalid:ring-0',
				className,
			)}
			{...props}
		/>
	);
}

export function InputGroupTextarea({
	className,
	...props
}: ComponentProps<typeof ShadcnInputGroupTextarea>) {
	return (
		<ShadcnInputGroupTextarea
			className={cn(
				'px-0 text-base text-gray-800 caret-brand-base',
				'placeholder:font-normal placeholder:text-gray-400',
				'focus-visible:ring-0 aria-invalid:ring-0',
				className,
			)}
			{...props}
		/>
	);
}
