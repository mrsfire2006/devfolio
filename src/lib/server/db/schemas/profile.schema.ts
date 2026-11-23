import type { About, Contact, Hero } from '#lib/types/profile.ts';
import { jsonb, pgTable, text } from 'drizzle-orm/pg-core';

export const profile = pgTable('profile', {
	id: text('id').primaryKey(),
	about: jsonb('about').$type<About>().notNull(),
	hero: jsonb('hero').$type<Hero>().notNull(),
	contact: jsonb('contact').$type<Contact>().notNull()
});
