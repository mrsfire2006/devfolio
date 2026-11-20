import { db } from '#lib/server/db/index.js';
import { ServerResult } from '#lib/dtos/result.ts';
import type { PublicFullProject, PublicProjectCard } from '#lib/dtos/project/public.ts';

export const GET = async ({ url }) => {
	const isFull = url.searchParams.get('include') === 'full';

	try {
		if (isFull) {
			const rows = await db.query.project.findMany({
				columns: { createdAt: false, updatedAt: false },
				with: {
					images: {
						columns: { fileId: false },
						orderBy: (img, { asc }) => [asc(img.createdAt)]
					},
					projectSkills: {
						columns: { projectId: false, skillId: false },
						with: {
							skill: {
								columns: { name: true, icon: true }
							}
						}
					}
				}
			});
			const result: PublicFullProject[] = rows.map(({ projectSkills, ...project }) => ({
				...project,
				skills: projectSkills.map(({ skill }) => skill!),
				totalSkills: projectSkills.length
			}));
			return Response.json(ServerResult.Success(result).GetClientResult());
		}

		const rows = await db.query.project.findMany({
			columns: { createdAt: false, updatedAt: false },
			with: {
				images: {
					columns: { fileId: false },
					orderBy: (img, { asc }) => [asc(img.createdAt)],
					limit: 1
				},
				projectSkills: {
					columns: { projectId: false, skillId: false },
					with: {
						skill: {
							columns: { name: true, icon: true }
						}
					}
				}
			}
		});
		const result: PublicProjectCard[] = rows.map(({ projectSkills, ...project }) => ({
			...project,
			skills: projectSkills.map(({ skill }) => skill!),
			totalSkills: projectSkills.length,
			image: project.images[0]
		}));

		return Response.json(ServerResult.Success(result).GetClientResult());
	} catch (error) {
		console.error('Failed to get projects:', error);

		return Response.json(ServerResult.Failure('Internal Server Error', 500).GetClientResult(), {
			status: 500
		});
	}
};
