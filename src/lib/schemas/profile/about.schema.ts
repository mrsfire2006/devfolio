import { z } from 'zod';

export const aboutTabSchema = z.object({
	id: z.string(),
	title: z.string(),
	pill: z.string(),
	lines: z.array(z.string()),
	text: z.string()
});

export const aboutSchema = z.object({
	tabs: z.array(aboutTabSchema)
});

export type AboutTab = z.infer<typeof aboutTabSchema>;
export type About = z.infer<typeof aboutSchema>;
