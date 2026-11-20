import { pgTable, primaryKey, text } from 'drizzle-orm/pg-core';
import { project } from './project.schema';
import { skill } from './skill.schema';
import { relations } from 'drizzle-orm';

export const projectSkill = pgTable(
	'project_skill',
	{
		projectId: text('project_id').references(() => project.id, { onDelete: 'cascade' }),
		skillId: text('skill_id').references(() => skill.id, { onDelete: 'cascade' })
	},
	(table) => [
		primaryKey({
			columns: [table.projectId, table.skillId]
		})
	]
);

export const projectSkillRelations = relations(projectSkill, ({ one }) => ({
	project: one(project, {
		fields: [projectSkill.projectId],
		references: [project.id]
	}),

	skill: one(skill, {
		fields: [projectSkill.skillId],
		references: [skill.id]
	})
}));

export type SelectProjectSkill = typeof projectSkill.$inferSelect;
