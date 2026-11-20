import { projectImageSchema, projectSchema } from '#lib/schemas/project.schema.ts';
import * as z from 'zod';

export const privateProjectCardSchema = projectSchema.extend({
	image: projectImageSchema.nullable(),
	skills: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			description: z.string().nullable(),
			icon: z.string().nullable(),
			createdAt: z.date()
		})
	),
	totalSkills: z.number()
});

export const privateFullProjectSchema = privateProjectCardSchema
	.omit({
		image: true
	})
	.extend({
		images: z.array(projectImageSchema.nullable())
	});

export const createProjectSchema = projectSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true
});
export const editProjectSchema = privateProjectCardSchema.omit({
	createdAt: true,
	updatedAt: true
});

export type PrivateProjectCard = z.infer<typeof privateProjectCardSchema>;
export type PrivateFullProject = z.infer<typeof privateFullProjectSchema>;
export type CreateProject = z.infer<typeof createProjectSchema>;
export type EditProject = z.infer<typeof editProjectSchema>;
