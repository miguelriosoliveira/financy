import { useEffect } from 'react';
import { Navigate, Outlet, Link as RouterLink, useLocation } from 'react-router';
import Logo from '@/assets/logo.svg';
import { Link } from '@/components/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useCurrentUser } from '@/hooks/use-current-user';
import { isAuthenticated } from '@/lib/auth';
import { notifyAuthRedirect } from '@/lib/auth-feedback';
import { getInitials } from '@/lib/initials';

export function AuthenticatedLayout() {
	const location = useLocation();
	const authed = isAuthenticated();
	const { user } = useCurrentUser();

	useEffect(() => {
		if (!authed) {
			notifyAuthRedirect();
		}
	}, [authed]);

	if (!authed) {
		return <Navigate to="/login" replace />;
	}

	const initials = user ? getInitials(user.name) : '';

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

				<RouterLink to="/profile" aria-label="Perfil">
					<Avatar className="size-9">
						<AvatarFallback className="bg-gray-300 text-gray-800">{initials}</AvatarFallback>
					</Avatar>
				</RouterLink>
			</header>

			<main className="p-12">
				<Outlet />
			</main>
		</main>
	);
}
