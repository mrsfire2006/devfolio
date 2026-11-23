import z from 'zod';
import { aboutSchema } from './about.schema';
import { heroSchema } from './hero.schema';
import { contactSchema } from './contact.schema';

export const profileSchema = z.object({
	id: z.string(),
	about: aboutSchema,
	hero: heroSchema,
	contact: contactSchema
});


export type Profile = z.infer<typeof profileSchema>