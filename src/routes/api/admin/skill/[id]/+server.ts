import { requireAuth } from '#lib/server/auth.helper.ts';
import { db } from '#lib/server/db/index.ts';
import { skill } from '#lib/server/db/schemas/skill.schema.ts';
import { ServerResult } from '#lib/dtos/result.ts';
import { eq } from 'drizzle-orm';

export const DELETE = requireAuth(async ({ params }) => {
	const skillId = params.id;
	if (!skillId) {
		return Response.json(ServerResult.Failure('Skill Id is required.').GetClientResult(), {
			status: 400
		});
	}
	try {
		const [deletedSkill] = await db.delete(skill).where(eq(skill.id, skillId)).returning();

		if (!deletedSkill) {
			return Response.json(ServerResult.Failure('Skill not found.').GetClientResult(), {
				status: 404
			});
		}

		return Response.json(ServerResult.Success(deletedSkill).GetClientResult());
	} catch {
		return Response.json(ServerResult.Failure('Ineternal Server Error', 500).GetClientResult(), {
			status: 500
		});
	}
});
