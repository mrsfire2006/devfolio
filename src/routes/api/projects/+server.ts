import { db } from '#lib/server/db/index.js';
import { ServerResult } from '#lib/dtos/result.ts';
import { publicProjectCardSchema, type PublicProjectCard } from '#lib/dtos/project/public.ts';

export const GET = async () => {
	try {
		const rows = await db.query.project.findMany({
			columns: {
				createdAt: false,
				updatedAt: false
			},
			with: {
				images: {
					columns: {
						url: true
					},
					orderBy: (img, { asc }) => [asc(img.createdAt)],
					limit: 1
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

		const result: PublicProjectCard[] = rows.map(({ projectSkills, images, ...project }) => {
			const skills = projectSkills.map(({ skill }) => skill).filter((skill) => skill !== null);

			return {
				...project,
				image: images[0] ? { url: images[0].url } : null,
				skills,
				totalSkills: skills.length
			};
		});

		const validatedResult = publicProjectCardSchema.array().parse(result);

		return Response.json(ServerResult.Success(validatedResult).GetClientResult());
	} catch (error) {
		console.error('Failed to get projects:', error);

		return Response.json(ServerResult.Failure('Internal Server Error', 500).GetClientResult(), {
			status: 500
		});
	}
};
