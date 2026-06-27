import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import Logo from '@/assets/logo.svg';
import { Link } from '@/components/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { notifyAuthRedirect } from '@/lib/auth-feedback';
import { isAuthenticated } from '@/lib/auth';

export function AuthenticatedLayout() {
	const location = useLocation();
	const authed = isAuthenticated();

	useEffect(() => {
		if (!authed) {
			notifyAuthRedirect();
		}
	}, [authed]);

	if (!authed) {
		return <Navigate to="/login" replace />;
	}

	return (
		<main className="min-h-screen bg-gray-100">
			<header className="flex items-center justify-between border-gray-200 border-b bg-white px-12 py-4">
				<Link to="/">
					<img src={Logo} alt="Financy logo" className="h-6" />
				</Link>

				<div className="flex h-9 items-center gap-5 text-gray-600 text-sm">
					<Link to="/" isActive={location.pathname === '/'}>
						Dashboard
					</Link>
					<Link to="/transactions" isActive={location.pathname === '/transactions'}>
						Transações
					</Link>
					<Link to="/categories" isActive={location.pathname === '/categories'}>
						Categorias
					</Link>
				</div>

				<Avatar className="size-9">
					<AvatarFallback className="bg-gray-300 text-gray-800">CT</AvatarFallback>
				</Avatar>
			</header>

			<main className="p-12">
				<Outlet />
			</main>
		</main>
	);
}
