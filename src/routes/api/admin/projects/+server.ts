import { requireAuth } from '#lib/server/auth.helper.ts';
import { db } from '#lib/server/db/index.ts';
import { project } from '#lib/server/db/schemas/project.schema.ts';

import { ServerResult } from '#lib/dtos/result.ts';
import { randomUUID } from 'crypto';
import { privateProjectCardSchema, type CreateProject } from '#lib/dtos/project/private.ts';
import { publicProjectCardSchema } from '#lib/dtos/project/public.ts';

const validedProject = (project: CreateProject): boolean => {
	if (
		!project.name ||
		project.name === '' ||
		(project.status && project.status !== 'IN_PROGRESS' && project.status !== 'COMPLETED')
	) {
		return false;
	}

	return true;
};

// Create Project.
export const POST = requireAuth(async ({ request }) => {
	const body = (await request.json()) as CreateProject;
	const valided = validedProject(body);

	if (!valided) {
		return Response.json(ServerResult.Failure('Project Not valid.').GetClientResult(), {
			status: 400
		});
	}

	try {
		const [savedDb] = await db
			.insert(project)
			.values({
				id: randomUUID(),
				name: body.name,
				description: body.description,
				status: body.status,
				githubUrl: body.githubUrl
			})
			.returning();

		return Response.json(ServerResult.Success(savedDb).GetClientResult());
	} catch {
		return Response.json(ServerResult.Failure('Ineternal Server Error', 500).GetClientResult(), {
			status: 500
		});
	}
});

export const GET = requireAuth(async ({ url }) => {
	const isPrivate = url.searchParams.get('domain') === 'private';

	try {
		const rows = await db.query.project.findMany({
			with: {
				images: {
					orderBy: (img, { asc }) => [asc(img.createdAt)],
					limit: 1,
					columns: isPrivate
						? undefined
						: {
								url: true
							}
				},
				projectSkills: {
					columns: {
						projectId: false,
						skillId: false
					},
					with: {
						skill: {
							columns: {
								id: isPrivate,
								name: true,
								description: isPrivate,
								icon: true,
								createdAt: isPrivate
							}
						}
					}
				}
			}
		});

		const result = rows.map(({ projectSkills, images, ...project }) => ({
			...project,
			image: images[0] ?? null,
			skills: projectSkills.map(({ skill }) => skill).filter((skill) => skill !== null),
			totalSkills: projectSkills.length
		}));

		const responseSchema = isPrivate ? privateProjectCardSchema : publicProjectCardSchema;

		const validatedResult = responseSchema.array().parse(result);

		return Response.json(ServerResult.Success(validatedResult).GetClientResult());
	} catch (error) {
		console.error('Failed to get projects:', error);

		return Response.json(ServerResult.Failure('Internal Server Error', 500).GetClientResult(), {
			status: 500
		});
	}
});
