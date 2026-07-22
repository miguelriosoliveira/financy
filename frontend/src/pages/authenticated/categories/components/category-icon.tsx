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
import { tv } from 'tailwind-variants';
import type { TagColor } from '@/components/tag';

const iconTag = tv({
	slots: {
		wrapper: 'rounded-md p-3 text-2xl',
		icon: '',
	},
	variants: {
		color: {
			gray: { wrapper: 'bg-gray-200', icon: 'text-gray-700' },
			blue: { wrapper: 'bg-blue-light', icon: 'text-blue-base' },
			purple: { wrapper: 'bg-purple-light', icon: 'text-purple-base' },
			pink: { wrapper: 'bg-pink-light', icon: 'text-pink-base' },
			red: { wrapper: 'bg-red-light', icon: 'text-red-base' },
			orange: { wrapper: 'bg-orange-light', icon: 'text-orange-base' },
			yellow: { wrapper: 'bg-yellow-light', icon: 'text-yellow-base' },
			green: { wrapper: 'bg-green-light', icon: 'text-green-base' },
		},
	},
	defaultVariants: {
		color: 'gray',
	},
});

export const CATEGORY_ICONS = {
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
} satisfies Record<string, ElementType>;

export type CategoryType = keyof typeof CATEGORY_ICONS;

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

export function getCategoryIconClassName(color?: TagColor): string {
	return iconTag({ color }).icon();
}

type Props = {
	category: CategoryType;
	color?: TagColor;
};

export function CategoryIcon({ category, color }: Props) {
	const { wrapper, icon } = iconTag({ color });
	const Icon = CATEGORY_ICONS[category];

	return (
		<div className={wrapper()}>
			<Icon className={icon()} size={16} />
		</div>
	);
}
