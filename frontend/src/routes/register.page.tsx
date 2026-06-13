import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { registerSchema } from '@financy/shared';
import {
	EyeClosedIcon,
	EyeIcon,
	Loader2Icon,
	LockIcon,
	LogInIcon,
	MailIcon,
	UserRoundIcon,
} from 'lucide-react';
import { type SubmitEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
	Field,
	FieldDescription,
	FieldError,
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

const REGISTER = gql`
	mutation Register($data: RegisterInput!) {
		register(data: $data) {
			token
			refreshToken
		}
	}
`;

const REGISTER_FIELD_MESSAGES: Record<'name' | 'email' | 'password', string> = {
	name: 'Informe seu nome completo',
	email: 'Informe um e-mail válido',
	password: 'A senha deve ter no mínimo 8 caracteres',
};

export function RegisterPage() {
	const [showPassword, setShowPassword] = useState(false);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [errors, setErrors] = useState<Partial<Record<'name' | 'email' | 'password', string>>>({});
	const navigate = useNavigate();
	const [register, { loading }] = useMutation(REGISTER);

	function togglePasswordVisibility() {
		setShowPassword(showPassword => !showPassword);
	}

	function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		const result = registerSchema.safeParse({ name, email, password });
		if (!result.success) {
			const fieldErrors = result.error.flatten().fieldErrors;
			setErrors({
				...(fieldErrors.name && { name: REGISTER_FIELD_MESSAGES.name }),
				...(fieldErrors.email && { email: REGISTER_FIELD_MESSAGES.email }),
				...(fieldErrors.password && { password: REGISTER_FIELD_MESSAGES.password }),
			});
			return;
		}
		setErrors({});
		register({ variables: { data: result.data } })
			.then(() => {
				toast.success('Usuário cadastrado com sucesso');
				navigate('/login');
			})
			.catch(error => {
				console.error(error);
				toast.error('Erro ao cadastrar usuário');
			});
	}

	return (
		<Card className="w-full max-w-md [--card-spacing:--spacing(8)]">
			<CardContent>
				<form onSubmit={handleSubmit}>
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
									<InputGroupInput
										type="text"
										id="name"
										placeholder="Seu nome completo"
										value={name}
										onChange={e => setName(e.target.value)}
									/>
									<InputGroupAddon>
										<UserRoundIcon />
									</InputGroupAddon>
								</InputGroup>
								<FieldError>{errors.name}</FieldError>
							</Field>

							<Field>
								<FieldLabel htmlFor="email">E-mail</FieldLabel>
								<InputGroup>
									<InputGroupInput
										type="email"
										id="email"
										placeholder="mail@examplo.com"
										value={email}
										onChange={e => setEmail(e.target.value)}
									/>
									<InputGroupAddon>
										<MailIcon />
									</InputGroupAddon>
								</InputGroup>
								<FieldError>{errors.email}</FieldError>
							</Field>

							<Field>
								<FieldLabel htmlFor="password">Senha</FieldLabel>
								<InputGroup>
									<InputGroupInput
										type={showPassword ? 'text' : 'password'}
										id="password"
										placeholder="Digite sua senha"
										value={password}
										onChange={e => setPassword(e.target.value)}
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
								{errors.password ? (
									<FieldError>{errors.password}</FieldError>
								) : (
									<FieldDescription className="text-xs">
										A senha deve ter no mínimo 8 caracteres
									</FieldDescription>
								)}
							</Field>

							<Field>
								<Button
									type="submit"
									className="bg-brand-base hover:bg-brand-dark"
									disabled={loading}
								>
									{loading ? <Loader2Icon className="animate-spin" /> : 'Cadastrar'}
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
