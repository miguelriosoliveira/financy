import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { AuthenticatedLayout } from './pages/authenticated/authenticated.layout';
import { CategoriesPage } from './pages/authenticated/categories.page';
import { HomePage } from './pages/authenticated/home.page';
import { TransactionsPage } from './pages/authenticated/transactions.page';
import { LoginPage } from './pages/non-authenticated/login.page';
import { AuthLayout } from './pages/non-authenticated/non-authenticated.layout';
import { RegisterPage } from './pages/non-authenticated/register.page';

export function AppRoutes() {
	return (
		<Routes>
			<Route element={<AuthLayout />}>
				<Route path="login" element={<LoginPage />} />
				<Route path="register" element={<RegisterPage />} />
			</Route>
			<Route element={<AuthenticatedLayout />}>
				<Route path="/" element={<HomePage />} />
				<Route path="/transactions" element={<TransactionsPage />} />
				<Route path="/categories" element={<CategoriesPage />} />
			</Route>
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

export function Router() {
	return (
		<BrowserRouter>
			<AppRoutes />
		</BrowserRouter>
	);
}
