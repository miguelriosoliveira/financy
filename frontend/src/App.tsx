import { EyeClosedIcon, EyeIcon, LockIcon, MailIcon, UserRoundPlusIcon } from 'lucide-react';
import { useState } from 'react';
import Logo from './assets/logo.svg';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Checkbox } from './components/ui/checkbox';
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSeparator,
	FieldSet,
} from './components/ui/field';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from './components/ui/input-group';

export function App() {
	const [showPassword, setShowPassword] = useState(false);

	function togglePasswordVisibility() {
		setShowPassword(showPassword => !showPassword);
	}

	return (
		<div className="bg-gray-100 flex flex-col items-center justify-start min-h-screen py-12 gap-8">
			<img src={Logo} alt="Financy logo" />

			<Card className="w-full max-w-md [--card-spacing:--spacing(8)]">
				<CardContent>
					<form>
						<FieldGroup>
							<FieldSet>
								<FieldLegend className="text-center">
									<span className="text-xl font-bold text-gray-800">Fazer login</span>
								</FieldLegend>
								<FieldDescription className="text-center text-base text-gray-600">
									Entre na sua conta para continuar
								</FieldDescription>

								<Field>
									<FieldLabel htmlFor="email">E-mail</FieldLabel>
									<InputGroup>
										<InputGroupInput type="email" id="email" placeholder="mail@examplo.com" />
										<InputGroupAddon>
											<MailIcon />
										</InputGroupAddon>
									</InputGroup>
								</Field>

								<Field>
									<FieldLabel htmlFor="password">Senha</FieldLabel>
									<InputGroup>
										<InputGroupInput
											type={showPassword ? 'text' : 'password'}
											id="password"
											placeholder="Digite sua senha"
										/>
										<InputGroupAddon>
											<LockIcon />
										</InputGroupAddon>
										<InputGroupAddon align="inline-end">
											<InputGroupButton
												className="text-gray-700"
												onClick={togglePasswordVisibility}
											>
												{showPassword ? <EyeIcon /> : <EyeClosedIcon />}
											</InputGroupButton>
										</InputGroupAddon>
									</InputGroup>
								</Field>

								<div className="flex justify-between">
									<Field orientation="horizontal" className="w-fit">
										<Checkbox id="remember" />
										<FieldLabel htmlFor="remember">Lembrar-me</FieldLabel>
									</Field>
									<a href="/forgot-password" className="text-brand-base hover:underline">
										Recuperar senha
									</a>
								</div>

								<Field>
									<Button type="submit" className="bg-brand-base hover:bg-brand-dark">
										Entrar
									</Button>
								</Field>

								<FieldSeparator>ou</FieldSeparator>

								<div className="text-center text-gray-600">Ainda não tem uma conta?</div>
								<Button type="button" variant="outline" className="hover:bg-gray-200" asChild>
									<a href="/register">
										<UserRoundPlusIcon /> Criar conta
									</a>
								</Button>
							</FieldSet>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
