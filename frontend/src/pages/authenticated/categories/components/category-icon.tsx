import {
	BriefcaseBusinessIcon,
	CarFrontIcon,
	HeartPulseIcon,
	PiggyBankIcon,
	ShoppingCartIcon,
	TicketIcon,
	ToolCaseIcon,
	UtensilsIcon,
} from 'lucide-react';
import type { ElementType } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

const iconTag = tv({
	slots: {
		wrapper: 'rounded-md p-3 text-2xl',
		icon: '',
	},
	variants: {
		category: {
			food: { wrapper: 'bg-blue-light', icon: 'text-blue-base' },
			entertainment: { wrapper: 'bg-pink-light', icon: 'text-pink-base' },
			investment: { wrapper: 'bg-green-light', icon: 'text-green-base' },
			groceries: { wrapper: 'bg-orange-light', icon: 'text-orange-base' },
			salary: { wrapper: 'bg-green-light', icon: 'text-green-base' },
			health: { wrapper: 'bg-red-light', icon: 'text-red-base' },
			transport: { wrapper: 'bg-purple-light', icon: 'text-purple-base' },
			utilities: { wrapper: 'bg-yellow-light', icon: 'text-yellow-base' },
		},
	},
	defaultVariants: {
		category: 'food',
	},
});

export type CategoryType = keyof typeof iconTag.variants.category;

const CATEGORY_ICONS: Record<CategoryType, ElementType> = {
	food: UtensilsIcon,
	entertainment: TicketIcon,
	investment: PiggyBankIcon,
	groceries: ShoppingCartIcon,
	salary: BriefcaseBusinessIcon,
	health: HeartPulseIcon,
	transport: CarFrontIcon,
	utilities: ToolCaseIcon,
};

export function CategoryIcon({ category }: VariantProps<typeof iconTag>) {
	const { wrapper, icon } = iconTag({ category });
	const Icon = CATEGORY_ICONS[category || 'food'];

	return (
		<div className={wrapper()}>
			<Icon className={icon()} size={16} />
		</div>
	);
}
