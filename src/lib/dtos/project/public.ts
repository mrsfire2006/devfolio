import { projectImageSchema, projectSchema } from '#lib/schemas/project.schema.ts';
import * as z from 'zod';

export const publicProjectCardSchema = projectSchema
	.omit({
		createdAt: true,
		updatedAt: true
	})
	.extend({
		image: projectImageSchema
			.pick({
				url: true
			})
			.nullable(),
		skills: z.array(
			z.object({
				name: z.string(),
				icon: z.string().nullable()
			})
		),
		totalSkills: z.number()
	});

export const publicFullProjectSchema = publicProjectCardSchema
	.omit({
		image: true
	})
	.extend({
		images: z.array(
			projectImageSchema
				.pick({
					url: true
				})
				.nullable()
		)
	});

export type PublicProjectCard = z.infer<typeof publicProjectCardSchema>;
export type PublicFullProject = z.infer<typeof publicFullProjectSchema>;
