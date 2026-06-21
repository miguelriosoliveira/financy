import {
	BaggageClaimIcon,
	BookOpenIcon,
	BriefcaseBusinessIcon,
	CarFrontIcon,
	DumbbellIcon,
	GiftIcon,
	HeartPulseIcon,
	HouseIcon,
	MailboxIcon,
	PawPrintIcon,
	PiggyBankIcon,
	ReceiptTextIcon,
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
			salary: { wrapper: 'bg-green-light', icon: 'text-green-base' },
			transport: { wrapper: 'bg-purple-light', icon: 'text-purple-base' },
			health: { wrapper: 'bg-red-light', icon: 'text-red-base' },
			investment: { wrapper: 'bg-green-light', icon: 'text-green-base' },
			groceries: { wrapper: 'bg-orange-light', icon: 'text-orange-base' },
			entertainment: { wrapper: 'bg-pink-light', icon: 'text-pink-base' },
			utilities: { wrapper: 'bg-yellow-light', icon: 'text-yellow-base' },
			food: { wrapper: 'bg-blue-light', icon: 'text-blue-base' },
			pets: { wrapper: 'bg-orange-light', icon: 'text-orange-base' },
			home: { wrapper: 'bg-blue-light', icon: 'text-blue-base' },
			gifts: { wrapper: 'bg-pink-light', icon: 'text-pink-base' },
			fitness: { wrapper: 'bg-red-light', icon: 'text-red-base' },
			education: { wrapper: 'bg-purple-light', icon: 'text-purple-base' },
			travel: { wrapper: 'bg-blue-light', icon: 'text-blue-base' },
			mail: { wrapper: 'bg-yellow-light', icon: 'text-yellow-base' },
			bills: { wrapper: 'bg-yellow-light', icon: 'text-yellow-base' },
		},
	},
	defaultVariants: {
		category: 'food',
	},
});

export type CategoryType = keyof typeof iconTag.variants.category;

export const CATEGORY_ICONS: Record<CategoryType, ElementType> = {
	salary: BriefcaseBusinessIcon,
	transport: CarFrontIcon,
	health: HeartPulseIcon,
	investment: PiggyBankIcon,
	groceries: ShoppingCartIcon,
	entertainment: TicketIcon,
	utilities: ToolCaseIcon,
	food: UtensilsIcon,
	pets: PawPrintIcon,
	home: HouseIcon,
	gifts: GiftIcon,
	fitness: DumbbellIcon,
	education: BookOpenIcon,
	travel: BaggageClaimIcon,
	mail: MailboxIcon,
	bills: ReceiptTextIcon,
};

export const CATEGORY_LABELS: Record<CategoryType, string> = {
	salary: 'Salário',
	transport: 'Transporte',
	health: 'Saúde',
	investment: 'Investimento',
	groceries: 'Mercado',
	entertainment: 'Entretimento',
	utilities: 'Utilidades',
	food: 'Alimentação',
	pets: 'Pets',
	home: 'Casa',
	gifts: 'Presentes',
	fitness: 'Fitness',
	education: 'Educação',
	travel: 'Viagem',
	mail: 'Correio',
	bills: 'Contas',
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
