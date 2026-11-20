import { ServerResult } from '#lib/dtos/result.ts';
import type { RequestHandler } from '@sveltejs/kit';

export const requireAuth = (handler: RequestHandler): RequestHandler => {
	return async (event) => {
		const user = event.locals.user;
		if (!user) {
			return Response.json(ServerResult.Failure('Unauthorized', 401).GetClientResult(), {
				status: 401
			});
		}

		return handler(event);
	};
};
