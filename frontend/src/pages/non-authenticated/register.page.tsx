import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { registerSchema } from '@financy/shared';
import { EyeClosedIcon, EyeIcon, LockIcon, LogInIcon, MailIcon, UserRoundIcon } from 'lucide-react';
import { type SubmitEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import z from 'zod';
import { Form } from '@/components/form';
import { FormField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { FieldSeparator } from '@/components/ui/field';
import { clearTokens } from '@/lib/auth';

const REGISTER = gql`
	mutation Register($data: RegisterInput!) {
		register(data: $data) {
			success
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
			const fieldErrors = z.treeifyError(result.error).properties;
			setErrors({
				...(fieldErrors?.name && { name: REGISTER_FIELD_MESSAGES.name }),
				...(fieldErrors?.email && { email: REGISTER_FIELD_MESSAGES.email }),
				...(fieldErrors?.password && { password: REGISTER_FIELD_MESSAGES.password }),
			});
			return;
		}
		setErrors({});
		register({ variables: { data: result.data } })
			.then(() => {
				clearTokens();
				toast.success('Usuário cadastrado com sucesso');
				navigate('/login');
			})
			.catch(() => toast.error('Erro ao cadastrar usuário'));
	}

	const fieldset = (
		<>
			<FormField
				label="Nome completo"
				id="name"
				type="text"
				placeholder="Seu nome completo"
				value={name}
				onChange={e => setName(e.target.value)}
				error={errors.name}
				icon={<UserRoundIcon />}
			/>

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
		</>
	);

	const afterSubmitButton = (
		<>
			<FieldSeparator>ou</FieldSeparator>

			<div className="text-center text-gray-600">Já tem uma conta?</div>

			<Button type="button" variant="outline" className="hover:bg-gray-200" asChild>
				<a href="/login">
					<LogInIcon /> Fazer login
				</a>
			</Button>
		</>
	);

	return (
		<Form
			title="Criar conta"
			description="Comece a controlar suas finanças ainda hoje"
			submitButtonText="Cadastrar"
			fieldset={fieldset}
			loading={loading}
			handleSubmit={handleSubmit}
			afterSubmitButton={afterSubmitButton}
		/>
	);
}
