import type { ComponentProps } from 'react';
import { Field, FieldDescription, FieldLabel } from './ui/field';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from './ui/input-group';

type Props = ComponentProps<typeof InputGroupInput> & {
	label: string;
	error?: string;
	icon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	rightIconClick?: () => void;
};

export function FormField({ label, error, icon, rightIcon, rightIconClick, ...inputProps }: Props) {
	return (
		<Field>
			<FieldLabel htmlFor={inputProps.id} className="font-normal">
				{label}
			</FieldLabel>

			<InputGroup className="h-auto px-1">
				{icon && <InputGroupAddon className="text-gray-400">{icon}</InputGroupAddon>}

				<InputGroupInput
					{...inputProps}
					className="h-auto py-3.5 placeholder:font-light placeholder:text-base placeholder:text-gray-400"
				/>

				{rightIcon && (
					<InputGroupAddon align="inline-end">
						<InputGroupButton className="text-gray-700" onClick={rightIconClick}>
							{rightIcon}
						</InputGroupButton>
					</InputGroupAddon>
				)}
			</InputGroup>

			{error && <FieldDescription className="text-xs">{error}</FieldDescription>}
		</Field>
	);
}
