import z from 'zod';

export const skillSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	icon: z.string().nullable(),
	createdAt: z.date()
});
