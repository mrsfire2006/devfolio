	import { relations } from 'drizzle-orm';
	import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
	import { projectSkill } from './junction.schema';

	export const skill = pgTable('skill', {
		id: text('id').primaryKey(),
		name: text('name').notNull(),
		description: text('description'),
		icon: text('icon'),
		createdAt: timestamp('created_at').defaultNow().notNull()
	});
	export const skillRelations = relations(skill, ({ many }) => ({
		projectSkills: many(projectSkill)
	}));

	export type InsertSkill = typeof skill.$inferInsert;
	export type SelectSkill = typeof skill.$inferSelect;
