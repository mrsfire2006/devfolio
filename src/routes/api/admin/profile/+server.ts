import { error } from '@sveltejs/kit';
import { db } from '#lib/server/db/index.ts';
import { profile } from '#lib/server/db/schemas/profile.schema.ts';
import { profileSchema, type Profile } from '#lib/schemas/profile/profile.schema.ts';
import { ServerResult } from '#lib/dtos/result.ts';
import { eq } from 'drizzle-orm';

async function getProfile(): Promise<Profile> {
	const [existingProfile] = await db.select().from(profile).where(eq(profile.id, 'main')).limit(1);

	if (existingProfile) {
		return existingProfile;
	}

	const emptyProfile = {
		id: 'main',
		about: {
			tabs: []
		},
		hero: {
			name: '',
			headline: '',
			lines: [],
			description: ''
		},
		contact: {
			links: []
		}
	};

	const [createdProfile] = await db
		.insert(profile)
		.values(emptyProfile)
		.onConflictDoNothing({ target: profile.id })
		.returning();

	if (createdProfile) {
		return createdProfile;
	}

	const [concurrentProfile] = await db
		.select()
		.from(profile)
		.where(eq(profile.id, 'main'))
		.limit(1);

	if (!concurrentProfile) {
		throw new Error('Failed to initialize profile.');
	}

	return concurrentProfile;
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
