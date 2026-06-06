import Logo from './assets/logo.svg';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';

export function App() {
	return (
		<div className="bg-gray-100 flex flex-col items-center justify-start min-h-screen py-12 gap-8">
			<img src={Logo} alt="Financy logo" />

			<Card className="max-w-md p-8">
				<CardHeader>
					<CardTitle>Fazer login</CardTitle>
					<CardDescription>Entre na sua conta para continuar</CardDescription>
				</CardHeader>

				<CardContent>
					<form>
						<input type="email" placeholder="mail@examplo.com" />
						<input type="password" placeholder="Digite sua senha" />
						<input type="checkbox" /> Lembrar-me
						<a href="/forgot-password">Recuperar senha</a>
						<button type="submit">Entrar</button>
					</form>

					<div className="flex items-center gap-3 text-gray-500">
						<hr className="flex-1 text-gray-300" />
						ou
						<hr className="flex-1 text-gray-300" />
					</div>

					<span>Ainda não tem uma conta?</span>
					<button type="button">
						<a href="/register">Criar conta</a>
					</button>
				</CardContent>
			</Card>
		</div>
	);
}
