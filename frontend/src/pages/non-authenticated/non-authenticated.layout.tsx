import { Outlet } from 'react-router';
import Logo from '@/assets/logo.svg';
import { Card, CardContent } from '@/components/ui/card';

export function NonAuthenticatedLayout() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-start gap-8 bg-gray-100 py-12">
			<img src={Logo} alt="Financy logo" />
			<Card className="w-full max-w-md [--card-spacing:--spacing(8)]">
				<CardContent>
					<Outlet />
				</CardContent>
			</Card>
		</div>
	);
}
