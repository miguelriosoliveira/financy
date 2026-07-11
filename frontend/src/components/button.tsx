import type { ComponentProps, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { Button as ShadcnButton } from '@/components/ui/button';

const button = tv({
	base: 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
	variants: {
		color: {
			primary: 'bg-brand-base text-white hover:bg-brand-dark',
			secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-200',
			link: 'bg-transparent font-normal text-brand-base hover:bg-transparent hover:font-semibold',
		},
		size: {
			md: "h-12 px-4 py-3 text-base [&_svg:not([class*='size-'])]:size-[18px]",
			sm: "h-9 px-3 py-2 text-sm [&_svg:not([class*='size-'])]:size-4",
		},
	},
	defaultVariants: {
		color: 'primary',
		size: 'md',
	},
});

type Props = Omit<ComponentProps<typeof ShadcnButton>, 'size' | 'variant'> &
	VariantProps<typeof button> & {
		children: ReactNode;
	};

export function Button({ children, color, size, className, type = 'button', ...props }: Props) {
	return (
		<ShadcnButton className={button({ color, size, className })} type={type} {...props}>
			{children}
		</ShadcnButton>
	);
}
