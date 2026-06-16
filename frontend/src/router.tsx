import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router';
import { isAuthenticated } from './lib/auth';
import { AuthLayout } from './pages/auth/auth.layout';
import { LoginPage } from './pages/auth/login.page';
import { RegisterPage } from './pages/auth/register.page';
import { HomePage } from './pages/home.page';

function ProtectedRoute() {
	return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
}

export function AppRoutes() {
	return (
		<Routes>
			<Route element={<AuthLayout />}>
				<Route path="login" element={<LoginPage />} />
				<Route path="register" element={<RegisterPage />} />
			</Route>
			<Route element={<ProtectedRoute />}>
				<Route path="/" element={<HomePage />} />
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
