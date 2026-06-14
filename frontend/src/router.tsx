import { BrowserRouter, Route, Routes } from 'react-router';
import { AuthLayout } from './pages/auth.layout';
import { LoginPage } from './pages/login.page';
import { RegisterPage } from './pages/register.page';

export function Router() {
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<AuthLayout />}>
					<Route path="login" element={<LoginPage />} />
					<Route path="register" element={<RegisterPage />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}
