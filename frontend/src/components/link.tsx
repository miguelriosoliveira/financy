import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router';
import { Button } from './ui/button';

type Props = {
	children: ReactNode;
	to: string;
	isActive: boolean;
};

export function Link({ children, to, isActive }: Props) {
	return (
		<Button
			variant="link"
			asChild
			data-active={isActive}
			className="border-none p-0 font-normal text-gray-600 text-sm hover:font-semibold hover:text-brand-base data-[active=true]:font-semibold data-[active=true]:text-brand-base"
		>
			<RouterLink to={to}>{children}</RouterLink>
		</Button>
	);
}
