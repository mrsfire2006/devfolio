 import { requireAuth } from '#lib/server/auth.helper.ts';
import { db } from '#lib/server/db/index.ts';
import { skill } from '#lib/server/db/schemas/skill.schema.ts';
import { ServerResult } from '#lib/dtos/result.ts';
import type { CreateSkill, SkillCard } from '#lib/dtos/skill.ts';

import { randomUUID } from 'crypto';

export const POST = requireAuth(async ({ request }) => {
	const body = (await request.json()) as CreateSkill;

	try {
		const [saved] = await db
			.insert(skill)
			.values({
				id: randomUUID(),
				name: body.name,
				icon: body.icon,
				description: body.description
			})
			.returning();

		return Response.json(ServerResult.Success(saved).GetClientResult(), { status: 200 });
	} catch {
		return Response.json(ServerResult.Failure('Internal server error.').GetClientResult(), {
			status: 500
		});
	}
});
export const GET = requireAuth(async () => {
	try {
		const skills = await db.query.skill.findMany({
			columns: { createdAt: false }
		});

		if (!skills) {
			return Response.json(ServerResult.Failure('skills not found'), { status: 404 });
		}
		return Response.json(ServerResult.Success<SkillCard[]>(skills).GetClientResult(), {
			status: 200
		});
	} catch {
		return Response.json(ServerResult.Failure('Internal server error.').GetClientResult(), {
			status: 500
		});
	}
});
