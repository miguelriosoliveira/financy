import { z } from 'zod';

export const createCategorySchema = z.object({
	name: z.string().trim().min(1, 'Name is required'),
	description: z.string().trim().optional(),
	icon: z.string().trim().min(1, 'Icon is required'),
	color: z.string().trim().min(1, 'Color is required'),
});
export type CreateCategoryInputType = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema;
export type UpdateCategoryInputType = z.infer<typeof updateCategorySchema>;
