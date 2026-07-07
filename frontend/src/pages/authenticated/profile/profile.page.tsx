import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { updateProfileSchema } from '@financy/shared';
import { LogOutIcon, MailIcon, UserRoundIcon } from 'lucide-react';
import { type SubmitEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import z from 'zod';
import { Button } from '@/components/button';
import { FormField } from '@/components/form-field';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FieldDescription } from '@/components/ui/field';
import { GET_ME, useCurrentUser } from '@/hooks/use-current-user';
import { apolloClient } from '@/lib/apollo';
import { clearTokens } from '@/lib/auth';
import { getInitials } from '@/lib/initials';

const UPDATE_PROFILE = gql`
	mutation UpdateProfile($data: UpdateProfileInput!) {
		updateProfile(data: $data) {
			id
			name
			email
		}
	}
`;

const PROFILE_FIELD_MESSAGES: Record<'name', string> = {
	name: 'Informe seu nome completo',
};

type UpdateProfileResult = {
	updateProfile: {
		id: string;
		name: string;
		email: string;
	};
};

export function ProfilePage() {
	const { user, loading } = useCurrentUser();
	const [name, setName] = useState('');
	const [errors, setErrors] = useState<Partial<Record<'name', string>>>({});
	const [updateProfile, { loading: saving }] = useMutation<UpdateProfileResult>(UPDATE_PROFILE, {
		refetchQueries: [{ query: GET_ME }],
	});
	const navigate = useNavigate();

	useEffect(() => {
		if (user) {
			setName(user.name);
		}
	}, [user]);

	function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		const result = updateProfileSchema.safeParse({ name });
		if (!result.success) {
			const fieldErrors = z.treeifyError(result.error).properties;
			setErrors({
				...(fieldErrors?.name && { name: PROFILE_FIELD_MESSAGES.name }),
			});
			return;
		}
		setErrors({});
		updateProfile({ variables: { data: result.data } })
			.then(() => toast.success('Perfil atualizado com sucesso'))
			.catch(() => toast.error('Erro ao atualizar perfil'));
	}

	async function handleLogout() {
		clearTokens();
		await apolloClient.clearStore();
		navigate('/login');
	}

	if (loading || !user) {
		return null;
	}

	const initials = getInitials(user.name);

	return (
		<div className="flex justify-center">
			<div className="flex w-full max-w-md flex-col gap-8 rounded-xl border border-gray-200 bg-white p-8">
				<div className="flex flex-col items-center gap-6 text-center">
					<Avatar className="size-16">
						<AvatarFallback className="bg-gray-300 font-normal text-2xl text-gray-800">
							{initials}
						</AvatarFallback>
					</Avatar>
					<div className="flex flex-col gap-0.5">
						<p className="font-semibold text-gray-900 text-xl">{user.name}</p>
						<p className="font-light text-base text-gray-500">{user.email}</p>
					</div>
				</div>

				<hr className="border-gray-200" />

				<form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
					<FormField
						label="Nome completo"
						id="name"
						type="text"
						value={name}
						onChange={event => setName(event.target.value)}
						error={errors.name}
						icon={<UserRoundIcon className="size-4" />}
					/>

					<div className="flex flex-col gap-2">
						<FormField
							label="E-mail"
							id="email"
							type="email"
							value={user.email}
							readOnly
							disabled
							className="opacity-50"
							icon={<MailIcon className="size-4" />}
						/>
						<FieldDescription className="text-gray-500 text-xs">
							O e-mail não pode ser alterado
						</FieldDescription>
					</div>

					<div className="flex flex-col gap-4 pt-4">
						<Button type="submit" disabled={saving}>
							Salvar alterações
						</Button>
						<Button type="button" color="secondary" onClick={handleLogout}>
							<LogOutIcon className="text-red-500" />
							Sair da conta
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
