import { OptionSelector } from '@/components/option-selector';
import {
	CATEGORY_ICONS,
	CATEGORY_LABELS,
	type CategoryType,
} from './category-icon';

type Props = {
	value: CategoryType;
	onChange: (value: CategoryType) => void;
};

const ICON_OPTIONS = (Object.keys(CATEGORY_ICONS) as CategoryType[]).map(category => {
	const Icon = CATEGORY_ICONS[category];

	return {
		value: category,
		label: CATEGORY_LABELS[category],
		render: <Icon className="size-[18px]" />,
	};
});

export function IconSelector({ value, onChange }: Props) {
	return (
		<OptionSelector
			label="Ícone"
			value={value}
			onChange={onChange}
			options={ICON_OPTIONS}
		/>
	);
}
