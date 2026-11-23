import z from 'zod';

export const contactLinkSchema = z.object({
	id: z.string(),
	label: z.string(),
	hint: z.string(),
	href: z.string()
});

export const contactSchema = z.object({
	links: z.array(contactLinkSchema)
});

export type ContantLink = z.infer<typeof contactLinkSchema>;
export type Contant = z.infer<typeof contactSchema>;
