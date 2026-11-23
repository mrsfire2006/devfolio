import type { Profile } from '#lib/types/profile.ts';
import type { User, Session } from 'better-auth';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user?: User;
			session?: Session;
		}

		// interface Error {}
		// interface PageData {
		// 	user: User;
		// 	url: URL;
		// 	profile:Profile
		// }
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
