import { resolve } from '$app/paths';
import { redirect } from '@sveltejs/kit';

export function load({ locals }) {
	if (!locals.session) {
		redirect(303, resolve("/studio/login"));
	}

	return{
		user:locals.user
	}
}
