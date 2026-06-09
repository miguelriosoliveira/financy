import { BrowserRouter, Route, Routes } from 'react-router';
import { AuthLayout } from './routes/auth.layout';
import { LoginPage } from './routes/login.page';
import { RegisterPage } from './routes/register.page';

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
