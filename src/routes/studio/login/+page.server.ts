import { resolve } from '$app/paths';
import { redirect } from '@sveltejs/kit';

export function load({ locals }) {
	if (locals.session && locals.user) {
		redirect(303, resolve('/studio/dashboard'));
	}
}
