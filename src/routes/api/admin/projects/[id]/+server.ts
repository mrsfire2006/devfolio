import { requireAuth } from '#lib/server/auth.helper.ts';
import { db } from '#lib/server/db/index.ts';
import { project, projectImages } from '#lib/server/db/schemas/project.schema.ts';
import { imagekit } from '#lib/server/imagekit.ts';
import { ServerResult } from '#lib/dtos/result.ts';
import { eq } from 'drizzle-orm';
import type {
	EditProject,
	PrivateFullProject,
	PrivateProjectCard
} from '#lib/dtos/project/private.ts';

export const PATCH = requireAuth(async ({ request, params }) => {
	const body = (await request.json()) as EditProject;
	if (Object.keys(body).length === 0) {
		return Response.json(ServerResult.Failure('No Fields.').GetClientResult(), { status: 400 });
	}

	const projectId = params.id;

	if (!projectId) {
		return Response.json(ServerResult.Failure('Project Id is required.').GetClientResult(), {
			status: 400
		});
	}

	try {
		const [savedDb] = await db
			.update(project)
			.set({
				...body
			})
			.where(eq(project.id, projectId))
			.returning();
		if (!savedDb) {
			return Response.json(ServerResult.Failure('Project not found.').GetClientResult(), {
				status: 404
			});
		}

		return Response.json(ServerResult.Success(savedDb).GetClientResult());
	} catch {
		return Response.json(ServerResult.Failure('Ineternal Server Error', 500).GetClientResult(), {
			status: 500
		});
	}
});

export const DELETE = requireAuth(async ({ params }) => {
	const projectId = params.id;

	if (!projectId) {
		return Response.json(ServerResult.Failure('Project Id is required.').GetClientResult(), {
			status: 400
		});
	}

	try {
		const images = await db
			.select({ fileId: projectImages.fileId })
			.from(projectImages)
			.where(eq(projectImages.projectId, projectId));

		const [existingProject] = await db
			.select({ id: project.id })
			.from(project)
			.where(eq(project.id, projectId))
			.limit(1);

		if (!existingProject) {
			return Response.json(ServerResult.Failure('Project not found.').GetClientResult(), {
				status: 404
			});
		}

		// Delete all project images from ImageKit.
		await Promise.all(
			images
				.filter(({ fileId }) => Boolean(fileId))
				.map(({ fileId }) => imagekit.files.delete(fileId))
		);

		const [deletedProject] = await db.delete(project).where(eq(project.id, projectId)).returning();

		return Response.json(ServerResult.Success(deletedProject).GetClientResult());
	} catch (error) {
		console.error('Failed to delete project:', error);

		return Response.json(ServerResult.Failure('Internal Server Error', 500).GetClientResult(), {
			status: 500
		});
	}
});

export const GET = requireAuth(async ({ params, url }) => {
	const projectId = params.id;

	if (!projectId) {
		return Response.json(ServerResult.Failure('Project Id is required.').GetClientResult(), {
			status: 400
		});
	}

	const isFull = url.searchParams.get('include') === 'full';

	try {
		const row = isFull
			? await db.query.project.findFirst({
					where: eq(project.id, projectId),
					with: {
						images: { orderBy: (img, { asc }) => [asc(img.createdAt)] },
						projectSkills: {
							columns: { projectId: false, skillId: false },
							with: {
								skill: true
							}
						}
					}
				})
			: await db.query.project.findFirst({
					where: eq(project.id, projectId),
					with: {
						images: { orderBy: (img, { asc }) => [asc(img.createdAt)], limit: 1 },
						projectSkills: {
							columns: { projectId: false, skillId: false },
							with: {
								skill: { columns: { name: true, icon: true } }
							}
						}
					}
				});

		if (!row) {
			return Response.json(ServerResult.Failure('Project not found.').GetClientResult(), {
				status: 404
			});
		}
		const result: PrivateFullProject | PrivateProjectCard = {
			id: row.id,
			name: row.name,
			description: row.description,
			images: row.images,
			githubUrl: row.githubUrl,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
			status: row.status,
			metaData: row.metaData,
			livePreview: row.livePreview,
			totalSkills: row.projectSkills.length,
			skills: row.projectSkills.map((ps) => ps.skill!)
		};

		return Response.json(ServerResult.Success(result).GetClientResult());
	} catch (error) {
		console.error('Failed to get project:', error);

		return Response.json(ServerResult.Failure('Internal Server Error', 500).GetClientResult(), {
			status: 500
		});
	}
});
