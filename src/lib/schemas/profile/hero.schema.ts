import z from 'zod';

export const heroSchema = z.object({
	name: z.string(),
	headline: z.string(),
	lines: z.array(z.string()),
	description: z.string()
});

export type Hero = z.infer<typeof heroSchema>;
