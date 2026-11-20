 import { requireAuth } from '#lib/server/auth.helper.ts';
import { db } from '#lib/server/db/index.ts';
import { projectSkill } from '#lib/server/db/schemas/junction.schema.ts';
import { ServerResult } from '#lib/dtos/result.ts';
import { and, eq } from 'drizzle-orm';

export const DELETE = requireAuth(async ({ params }) => {
	const projectId = params.id;
	const skillId = params.skillId;

	if (!projectId || !skillId) {
		return Response.json(
			ServerResult.Failure('Project Id and Skill Id are required.').GetClientResult(),
			{
				status: 400
			}
		);
	}
	try {
		const result = await db
			.delete(projectSkill)
			.where(and(eq(projectSkill.projectId, projectId), eq(projectSkill.skillId, skillId)))
			.returning();

		if (result.length > 0) {
			return Response.json(ServerResult.Success().GetClientResult(), {
				status: 200
			});
		}
		return Response.json(
			ServerResult.Failure('Error while delete skill from project').GetClientResult(),
			{
				status: 400
			}
		);
	} catch (error) {
		console.error('Failed to remove skill from project:', error);
		return Response.json(ServerResult.Failure('Internal server error.', 500).GetClientResult(), {
			status: 500
		});
	}
});
