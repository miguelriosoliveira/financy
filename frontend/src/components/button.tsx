import type { ComponentProps, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { Button as ShadcnButton } from '@/components/ui/button';

const button = tv({
	base: "px-4 py-6 font-normal rounded-lg text-base [&_svg:not([class*='size-'])]:size-[18px]",
	variants: {
		color: {
			primary: 'bg-brand-base hover:bg-brand-dark text-white',
			secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-200',
		},
	},
	defaultVariants: {
		color: 'primary',
	},
});

type Props = ComponentProps<typeof ShadcnButton> &
	VariantProps<typeof button> & {
		children: ReactNode;
	};

export function Button({ children, color, type = 'button', ...props }: Props) {
	return (
		<ShadcnButton className={button({ color })} type={type} {...props}>
			{children}
		</ShadcnButton>
	);
}
