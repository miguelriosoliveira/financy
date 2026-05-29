import z from "zod";

export const env = z
	.object({
		JWT_SECRET: z.string().nonempty(),
		DATABASE_URL: z.url(),
	})
	.parse(process.env);
