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
			<FieldLabel htmlFor={inputProps.id}>{label}</FieldLabel>
			<InputGroup>
				<InputGroupInput {...inputProps} />
				{icon && <InputGroupAddon>{icon}</InputGroupAddon>}
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
