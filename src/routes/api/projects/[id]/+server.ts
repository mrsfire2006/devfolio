import { db } from '#lib/server/db/index.js';
import { project } from '#lib/server/db/schemas/project.schema.ts';
import { ServerResult } from '#lib/dtos/result.ts';
import { eq } from 'drizzle-orm';
import type { PublicFullProject } from '#lib/dtos/project/public.ts';

export const GET = async ({ params }) => {
	const projectId = params.id;

	if (!projectId) {
		return Response.json(ServerResult.Failure('Project Id is required.').GetClientResult(), {
			status: 400
		});
	}

	try {
		const row = await db.query.project.findFirst({
			where: eq(project.id, projectId),
			with: {
				images: {
					columns: { url: true },
					orderBy: (img, { asc }) => [asc(img.createdAt)]
				},
				projectSkills: {
					columns: {
						projectId: false,
						skillId: false
					},
					with: {
						skill: {
							columns: {
								name: true,
								icon: true
							}
						}
					}
				}
			}
		});

		if (!row) {
			return Response.json(ServerResult.Failure('Project not found.').GetClientResult(), {
				status: 404
			});
		}

		const result: PublicFullProject = {
			id: row.id,
			name: row.name,
			description: row.description,
			images: row.images,
			githubUrl: row.githubUrl,
			status: row.status,
			livePreview: row.livePreview,
			metaData: row.metaData,
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
};
