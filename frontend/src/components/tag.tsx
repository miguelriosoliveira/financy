import type { ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { Badge } from './ui/badge';

const tag = tv({
	base: 'font-normal rounded-xl px-3 py-3.5 text-sm',
	variants: {
		color: {
			gray: 'bg-gray-200 text-gray-700',
			blue: 'bg-blue-light text-blue-dark',
			purple: 'bg-purple-light text-purple-dark',
			pink: 'bg-pink-light text-pink-dark',
			red: 'bg-red-light text-red-dark',
			orange: 'bg-orange-light text-orange-dark',
			yellow: 'bg-yellow-light text-yellow-dark',
			green: 'bg-green-light text-green-dark',
		},
	},
	defaultVariants: {
		color: 'gray',
	},
});

export type TagColor = keyof typeof tag.variants.color;

type Props = VariantProps<typeof tag> & {
	children: ReactNode;
};

export function Tag({ children, ...props }: Props) {
	return <Badge className={tag(props)}>{children}</Badge>;
}
