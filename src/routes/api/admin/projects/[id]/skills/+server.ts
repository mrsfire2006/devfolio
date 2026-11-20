 import { requireAuth } from '#lib/server/auth.helper.ts';
import { db } from '#lib/server/db/index.ts';
import { projectSkill } from '#lib/server/db/schemas/junction.schema.ts';
import { ServerResult } from '#lib/dtos/result.ts';

export const POST = requireAuth(async ({ params, request }) => {
	const projectId = params.id;
	const body = (await request.json()) as { skillId: string };

	if (!projectId) {
		return Response.json(ServerResult.Failure('Project Id is required.').GetClientResult(), {
			status: 400
		});
	}
	try {
		const result = await db
			.insert(projectSkill)
			.values({
				projectId: projectId,
				skillId: body.skillId
			})
			.returning();

		if (result.length > 0) {
			return Response.json(ServerResult.Success().GetClientResult(), {
				status: 200
			});
		}
		return Response.json(ServerResult.Failure("Error while add skill to project").GetClientResult(), {
			status: 400
		});
	} catch {
		return Response.json(ServerResult.Failure('Internal server error.', 500).GetClientResult(), {
			status: 500
		});
	}
});
