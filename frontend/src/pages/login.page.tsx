import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { loginSchema } from '@financy/shared';
import { EyeClosedIcon, EyeIcon, LockIcon, MailIcon, UserRoundPlusIcon } from 'lucide-react';
import { type SubmitEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import z from 'zod';
import { Form } from '@/components/form';
import { FormField } from '@/components/form-field';
import { setTokens } from '@/lib/auth';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Field, FieldLabel, FieldSeparator } from '../components/ui/field';

const LOGIN = gql`
	mutation Login($data: LoginInput!) {
		login(data: $data) {
			token
			refreshToken
		}
	}
`;

const LOGIN_FIELD_MESSAGES: Record<'email' | 'password', string> = {
	email: 'Informe um e-mail válido',
	password: 'Informe uma senha válida',
};

type LoginMutationResult = {
	login?: {
		token: string;
		refreshToken: string;
	};
};

export function LoginPage() {
	const [showPassword, setShowPassword] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [errors, setErrors] = useState<Partial<Record<'email' | 'password', string>>>({});
	const [login, { loading }] = useMutation<LoginMutationResult>(LOGIN);
	const navigate = useNavigate();

	function togglePasswordVisibility() {
		setShowPassword(showPassword => !showPassword);
	}

	function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		const result = loginSchema.safeParse({ email, password });
		if (!result.success) {
			const fieldErrors = z.treeifyError(result.error).properties;
			setErrors({
				...(fieldErrors?.email && { email: LOGIN_FIELD_MESSAGES.email }),
				...(fieldErrors?.password && { password: LOGIN_FIELD_MESSAGES.password }),
			});
			return;
		}
		setErrors({});
		login({ variables: { data: result.data } })
			.then(({ data }) => {
				const loginResult = data?.login;
				if (loginResult?.token && loginResult?.refreshToken) {
					setTokens(loginResult.token, loginResult.refreshToken);
				}
				toast.success('Login realizado com sucesso');
				navigate('/');
			})
			.catch(error => {
				console.error(error);
				toast.error('Erro ao fazer login');
			});
	}

	const fieldset = (
		<>
			<FormField
				label="E-mail"
				id="email"
				type="email"
				placeholder="mail@examplo.com"
				value={email}
				onChange={e => setEmail(e.target.value)}
				error={errors.email}
				icon={<MailIcon />}
			/>

			<FormField
				label="Senha"
				id="password"
				type={showPassword ? 'text' : 'password'}
				placeholder="Digite sua senha"
				value={password}
				onChange={e => setPassword(e.target.value)}
				error={errors.password}
				icon={<LockIcon />}
				rightIcon={showPassword ? <EyeIcon /> : <EyeClosedIcon />}
				rightIconClick={togglePasswordVisibility}
			/>

			<div className="flex justify-between">
				<Field orientation="horizontal" className="w-fit">
					<Checkbox id="remember" />
					<FieldLabel htmlFor="remember">Lembrar-me</FieldLabel>
				</Field>
				<a href="/forgot-password" className="text-brand-base hover:underline">
					Recuperar senha
				</a>
			</div>
		</>
	);

	const afterSubmitButton = (
		<>
			<FieldSeparator>ou</FieldSeparator>

			<div className="text-center text-gray-600">Ainda não tem uma conta?</div>

			<Button type="button" variant="outline" className="hover:bg-gray-200" asChild>
				<a href="/register">
					<UserRoundPlusIcon /> Criar conta
				</a>
			</Button>
		</>
	);

	return (
		<Form
			title="Fazer login"
			description="Entre na sua conta para continuar"
			submitButtonText="Entrar"
			fieldset={fieldset}
			loading={loading}
			handleSubmit={handleSubmit}
			afterSubmitButton={afterSubmitButton}
		/>
	);
}
