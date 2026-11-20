import { relations } from 'drizzle-orm';
import { index, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { projectSkill } from './junction.schema';

export const projectStatus = pgEnum('project_status', ['IN_PROGRESS', 'COMPLETED']);

export const project = pgTable('project', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	livePreview: text('live_preview'),
	metaData: text('meta_data').default("App"),
	status: projectStatus('status').default('IN_PROGRESS'),
	githubUrl: text('github_url'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull()
});

export const projectImages = pgTable(
	'project_images',
	{
		id: text('id').primaryKey(),
		url: text('url').notNull(),
		fileId: text('file_id').notNull(),
		projectId: text('project_id')
			.notNull()
			.references(() => project.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index().on(table.projectId)]
);

export const projectRelations = relations(project, ({ many }) => ({
	images: many(projectImages),
	projectSkills: many(projectSkill)
}));

export const projectImagesRelations = relations(projectImages, ({ one }) => ({
	project: one(project, {
		fields: [projectImages.projectId],
		references: [project.id]
	})
}));

export type InsertProject = typeof project.$inferInsert;
export type SelectProject = typeof project.$inferSelect;

export type InsertImage = typeof projectImages.$inferInsert;
export type SelectImage = typeof projectImages.$inferSelect;

export type ProjectStatus = (typeof projectStatus.enumValues)[number];
