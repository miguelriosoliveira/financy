import { Loader2Icon } from 'lucide-react';
import { Button } from './ui/button';
import { Field } from './ui/field';

type Props = {
	text: string;
	loading: boolean;
};

export function SubmitButton({ text, loading }: Props) {
	return (
		<Field>
			<Button type="submit" className="bg-brand-base hover:bg-brand-dark" disabled={loading}>
				{loading ? <Loader2Icon className="animate-spin" /> : text}
			</Button>
		</Field>
	);
}
