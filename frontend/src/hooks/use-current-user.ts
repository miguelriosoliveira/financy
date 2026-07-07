import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

export const GET_ME = gql`
	query GetMe {
		user: getMe {
			id
			name
			email
		}
	}
`;

export type CurrentUser = {
	id: string;
	name: string;
	email: string;
};

type GetMeResult = {
	user: CurrentUser;
};

export function useCurrentUser() {
	const { data, loading, refetch } = useQuery<GetMeResult>(GET_ME);

	return {
		user: data?.user ?? null,
		loading,
		refetch,
	};
}
