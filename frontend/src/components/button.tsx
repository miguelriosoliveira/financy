import type { ComponentProps } from 'react';
import { Button as ShadcnButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Button({ children, className, ...props }: ComponentProps<typeof ShadcnButton>) {
	return (
		<ShadcnButton className={cn('bg-brand-base hover:bg-brand-dark', className)} {...props}>
			{children}
		</ShadcnButton>
	);
}
