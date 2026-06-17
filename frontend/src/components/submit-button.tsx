import { Loader2Icon } from 'lucide-react';
import { Button } from './button';
import { Field } from './ui/field';

type Props = {
	text: string;
	loading: boolean;
};

export function SubmitButton({ text, loading }: Props) {
	return (
		<Field>
			<Button type="submit" disabled={loading}>
				{loading ? <Loader2Icon className="animate-spin" /> : text}
			</Button>
		</Field>
	);
}
