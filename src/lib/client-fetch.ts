import type { ClientResult } from '#lib/dtos/result.ts';
import { resolve } from '$app/paths';

type QueryValue =
	string | number | boolean | null | undefined | readonly (string | number | boolean)[];

export function BuildQuery(params: Record<string, QueryValue>): string {
	const query = new URLSearchParams();

	for (const [key, value] of Object.entries(params)) {
		if (value == null) continue;

		const values = Array.isArray(value) ? value : [value];

		for (const item of values) {
			query.append(key, String(item));
		}
	}

	const result = query.toString();
	return result ? `?${result}` : '';
}

export async function ClientFetch<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<ClientResult<T>> {
	const headers = new Headers(options.headers);

	if (
		!headers.has('Content-Type') &&
		!(typeof FormData !== 'undefined' && options.body instanceof FormData)
	) {
		headers.set('Content-Type', 'application/json');
	}

	headers.set('Accept', 'application/json');
	const response = await fetch(endpoint, {
		...options,
		headers
	});

	if (response.status === 401) {
		if (typeof window !== 'undefined') {
			window.location.href = resolve('/studio/login');
		}

		throw new Error(response.statusText || 'Unauthorized');
	}

	let result: ClientResult<T>;

	try {
		result = (await response.json()) as ClientResult<T>;
	} catch {
		result = {
			isSuccess: response.ok,
			errorMsg: response.ok ? undefined : response.statusText,
			statusCode: response.status
		};
	}

	return {
		...result,
		isSuccess: response.ok && result.isSuccess,
		errorMsg: result.errorMsg ?? (!response.ok ? response.statusText : undefined),
		statusCode: response.status
	};
}
