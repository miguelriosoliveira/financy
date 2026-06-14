import { Outlet } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import Logo from '../assets/logo.svg';

export function AuthLayout() {
	return (
		<div className="bg-gray-100 flex flex-col items-center justify-start min-h-screen py-12 gap-8">
			<img src={Logo} alt="Financy logo" />
			<Card className="w-full max-w-md [--card-spacing:--spacing(8)]">
				<CardContent>
					<Outlet />
				</CardContent>
			</Card>
		</div>
	);
}
