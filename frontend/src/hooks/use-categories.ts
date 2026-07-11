import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import type { TagColor } from '@/components/tag';
import type { CategoryType } from '@/pages/authenticated/categories/components/category-icon';

export const GET_CATEGORIES = gql`
	query GetCategories($includeStats: Boolean = false) {
		getCategories(includeStats: $includeStats) {
			id
			name
			description
			icon
			color
			transactionCount @include(if: $includeStats)
			totalAmount @include(if: $includeStats)
		}
	}
`;

export type CategoryRow = {
	id: string;
	name: string;
	description: string | null;
	icon: CategoryType;
	color: TagColor;
	transactionCount?: number | null;
	totalAmount?: number | null;
};

export type GetCategoriesResult = {
	getCategories: CategoryRow[];
};

type UseCategoriesOptions = {
	includeStats?: boolean;
};

export function useCategories({ includeStats = false }: UseCategoriesOptions = {}) {
	const { data, loading } = useQuery<GetCategoriesResult>(GET_CATEGORIES, {
		variables: { includeStats },
	});

	return {
		categories: data?.getCategories ?? [],
		loading,
	};
}
