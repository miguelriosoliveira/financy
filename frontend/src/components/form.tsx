import type { ReactNode, SubmitEventHandler } from 'react';
import { SubmitButton } from './submit-button';
import { FieldDescription, FieldGroup, FieldLegend, FieldSet } from './ui/field';

type Props = {
	title: string;
	description: string;
	fieldset: ReactNode;
	submitButtonText: string;
	loading: boolean;
	afterSubmitButton: ReactNode;
	handleSubmit: SubmitEventHandler<HTMLFormElement>;
};

export function Form({
	title,
	description,
	fieldset,
	submitButtonText,
	loading,
	afterSubmitButton,
	handleSubmit,
}: Props) {
	return (
		<form noValidate onSubmit={handleSubmit}>
			<FieldGroup>
				<FieldSet>
					<FieldLegend className="text-center">
						<span className="text-xl font-bold text-gray-800">{title}</span>
					</FieldLegend>
					<FieldDescription className="text-center text-base text-gray-600">
						{description}
					</FieldDescription>

					{fieldset}

					<SubmitButton text={submitButtonText} loading={loading} />

					{afterSubmitButton}
				</FieldSet>
			</FieldGroup>
		</form>
	);
}
