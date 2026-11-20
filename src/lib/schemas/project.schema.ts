import z from 'zod';

export const projectStatusSchema = z.enum(['IN_PROGRESS', 'COMPLETED']);

export const projectSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	status: projectStatusSchema.nullable(),
	githubUrl: z.string().nullable(),
	livePreview: z.string().nullable(),
	metaData: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date()
});

export const projectImageSchema = z.object({
	id: z.string(),
	url: z.string(),
	projectId: z.string()
});
