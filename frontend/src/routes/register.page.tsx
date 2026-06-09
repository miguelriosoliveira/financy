import {
	EyeClosedIcon,
	EyeIcon,
	LockIcon,
	LogInIcon,
	MailIcon,
	UserIcon,
	UserRoundIcon,
	UserRoundPlusIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSeparator,
	FieldSet,
} from '../components/ui/field';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from '../components/ui/input-group';

export function RegisterPage() {
	const [showPassword, setShowPassword] = useState(false);

	function togglePasswordVisibility() {
		setShowPassword(showPassword => !showPassword);
	}

	return (
		<Card className="w-full max-w-md [--card-spacing:--spacing(8)]">
			<CardContent>
				<form>
					<FieldGroup>
						<FieldSet>
							<FieldLegend className="text-center">
								<span className="text-xl font-bold text-gray-800">Criar conta</span>
							</FieldLegend>
							<FieldDescription className="text-center text-base text-gray-600">
								Comece a controlar suas finanças ainda hoje
							</FieldDescription>

							<Field>
								<FieldLabel htmlFor="name">Nome completo</FieldLabel>
								<InputGroup>
									<InputGroupInput type="text" id="name" placeholder="Seu nome completo" />
									<InputGroupAddon>
										<UserRoundIcon />
									</InputGroupAddon>
								</InputGroup>
							</Field>

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
										<InputGroupButton className="text-gray-700" onClick={togglePasswordVisibility}>
											{showPassword ? <EyeIcon /> : <EyeClosedIcon />}
										</InputGroupButton>
									</InputGroupAddon>
								</InputGroup>
								<FieldDescription className="text-xs">
									A senha deve ter no mínimo 8 caracteres
								</FieldDescription>
							</Field>

							<Field>
								<Button type="submit" className="bg-brand-base hover:bg-brand-dark">
									Cadastrar
								</Button>
							</Field>

							<FieldSeparator>ou</FieldSeparator>

							<div className="text-center text-gray-600">Já tem uma conta?</div>
							<Button type="button" variant="outline" className="hover:bg-gray-200" asChild>
								<a href="/login">
									<LogInIcon /> Fazer login
								</a>
							</Button>
						</FieldSet>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
}
