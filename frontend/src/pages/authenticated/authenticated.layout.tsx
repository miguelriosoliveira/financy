import { Navigate, Outlet } from 'react-router';
import Logo from '@/assets/logo.svg';
import { isAuthenticated } from '@/lib/auth';

export function AuthenticatedLayout() {
	return isAuthenticated() ? (
		<main className="min-h-screen bg-gray-100">
			<header className="flex justify-between bg-white border-b border-gray-200">
				<img src={Logo} alt="Financy logo" />

				<div>
					<a href="/">Dashboard</a>
					<a href="/transactions">Transações</a>
					<a href="/categories">Categorias</a>
				</div>

				<div>Perfil</div>
			</header>

			<Outlet />
		</main>
	) : (
		<Navigate to="/login" replace />
	);
}
