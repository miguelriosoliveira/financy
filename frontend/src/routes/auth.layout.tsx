import { Outlet } from 'react-router';
import Logo from '../assets/logo.svg';

export function AuthLayout() {
	return (
		<div className="bg-gray-100 flex flex-col items-center justify-start min-h-screen py-12 gap-8">
			<img src={Logo} alt="Financy logo" />
			<Outlet />
		</div>
	);
}
