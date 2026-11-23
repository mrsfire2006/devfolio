import { error } from '@sveltejs/kit';
import { db } from '#lib/server/db/index.ts';
import { profile } from '#lib/server/db/schemas/profile.schema.ts';
import { profileSchema } from '#lib/schemas/profile/profile.schema.ts';
import { ServerResult } from '#lib/dtos/result.ts';

async function getProfile() {
	const records = await db.select().from(profile).limit(2);

	if (records.length > 1) {
		throw new Error('Expected exactly one profile record.');
	}

	return records[0] ?? null;
}
export const GET = async () => {
	const profile = await getProfile();

	const validatedResult = profileSchema.safeParse(profile);

	if (!validatedResult.success) {
		console.error('[GET /api/admin/profile] Invalid profile data:', validatedResult.error);

		error(500, 'Invalid profile data.');
	}

	return Response.json(ServerResult.Success(validatedResult.data).GetClientResult());
};
export const POST = async ({ request }) => {
	const body: unknown = await request.json();

	const validatedResult = profileSchema.omit({ id: true }).safeParse(body);

	if (!validatedResult.success) {
		return Response.json(ServerResult.Failure('Invalid profile data.', 400).GetClientResult(), {
			status: 400
		});
	}

	const { about, hero, contact } = validatedResult.data;

	const [savedProfile] = await db
		.insert(profile)
		.values({
			id: 'main',
			about,
			hero,
			contact
		})
		.onConflictDoUpdate({
			target: profile.id,
			set: {
				about,
				hero,
				contact
			}
		})
		.returning();

	return Response.json(ServerResult.Success(savedProfile).GetClientResult());
};
