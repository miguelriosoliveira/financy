import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router';
import { setNavigate } from './lib/navigation.ts';
import { AuthenticatedLayout } from './pages/authenticated/authenticated.layout';
import { CategoriesPage } from './pages/authenticated/categories/categories.page';
import { DashboardPage } from './pages/authenticated/dashboard/dashboard.page.tsx';
import { ProfilePage } from './pages/authenticated/profile/profile.page';
import { TransactionsPage } from './pages/authenticated/transactions/transactions.page';
import { LoginPage } from './pages/non-authenticated/login.page';
import { NonAuthenticatedLayout } from './pages/non-authenticated/non-authenticated.layout';
import { RegisterPage } from './pages/non-authenticated/register.page';

export function AppRoutes() {
	return (
		<Routes>
			<Route element={<NonAuthenticatedLayout />}>
				<Route path="login" element={<LoginPage />} />
				<Route path="register" element={<RegisterPage />} />
			</Route>
			<Route element={<AuthenticatedLayout />}>
				<Route path="/" element={<DashboardPage />} />
				<Route path="/transactions" element={<TransactionsPage />} />
				<Route path="/categories" element={<CategoriesPage />} />
				<Route path="/profile" element={<ProfilePage />} />
			</Route>
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

function NavigationBridge() {
	const navigate = useNavigate();

	useEffect(() => {
		setNavigate(navigate);
	}, [navigate]);

	return null;
}

export function Router() {
	return (
		<BrowserRouter>
			<NavigationBridge />
			<AppRoutes />
		</BrowserRouter>
	);
}
