import { OptionSelector } from '@/components/option-selector';
import type { TagColor } from '@/components/tag';
import { cn } from '@/lib/utils';

type Props = {
	value: TagColor;
	onChange: (value: TagColor) => void;
};

const COLOR_OPTIONS: Array<{
	value: TagColor;
	label: string;
	className: string;
}> = [
	{ value: 'green', label: 'Verde', className: 'bg-green-base' },
	{ value: 'blue', label: 'Azul', className: 'bg-blue-base' },
	{ value: 'purple', label: 'Roxo', className: 'bg-purple-base' },
	{ value: 'pink', label: 'Rosa', className: 'bg-pink-base' },
	{ value: 'red', label: 'Vermelho', className: 'bg-red-base' },
	{ value: 'orange', label: 'Laranja', className: 'bg-orange-base' },
	{ value: 'yellow', label: 'Amarelo', className: 'bg-yellow-base' },
];

export function ColorSelector({ value, onChange }: Props) {
	return (
		<OptionSelector
			label="Cor"
			value={value}
			onChange={onChange}
			className="grid-cols-7"
			itemClassName="aspect-auto h-7.5 p-1"
			options={COLOR_OPTIONS.map(color => ({
				value: color.value,
				label: color.label,
				render: <span className={cn('size-full rounded', color.className)} />,
			}))}
		/>
	);
}
