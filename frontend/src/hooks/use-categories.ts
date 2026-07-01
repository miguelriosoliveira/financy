import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import type { TagColor } from '@/components/tag';
import type { CategoryType } from '@/pages/authenticated/categories/components/category-icon';

export const GET_CATEGORIES = gql`
	query GetCategories {
		getCategories {
			id
			name
			description
			icon
			color
		}
	}
`;

export type CategoryRow = {
	id: string;
	name: string;
	description: string | null;
	icon: CategoryType;
	color: TagColor;
};

export type GetCategoriesResult = {
	getCategories: CategoryRow[];
};

export function useCategories() {
	const { data, loading } = useQuery<GetCategoriesResult>(GET_CATEGORIES);

	return {
		categories: data?.getCategories ?? [],
		loading,
	};
}
