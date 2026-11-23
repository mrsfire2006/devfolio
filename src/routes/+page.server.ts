import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import { resolve } from '$app/paths';
import { profileSchema } from '#lib/schemas/profile/profile.schema.ts';

export const load: PageServerLoad = async ({ fetch }) => {
	const response = await fetch(resolve('/api/admin/profile'), {
		method: 'GET'
	});

	if (!response.ok) {
		error(response.status, 'Failed to load profile.');
	}

	const result = await response.json();

	if (!result.isSuccess || !result.value) {
		error(result.statusCode ?? 500, result.errorMsg ?? 'Failed to load profile.');
	}

	const validatedResult = profileSchema.safeParse(result.value);

	if (!validatedResult.success) {
		console.error('[Homepage] Invalid profile data:', validatedResult.error);
		error(500, 'Invalid profile data.');
	}

	return {
		profile: validatedResult.data
	};
};
