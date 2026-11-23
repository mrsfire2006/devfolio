import { createQuery } from '@tanstack/svelte-query';

import { resolve } from '$app/paths';
import { ClientFetch } from '#lib/client-fetch.ts';
import type { Profile } from '#lib/schemas/profile/profile.schema.ts';
import type { ClientResult } from '#lib/dtos/result.ts';

export const profileQueryKey = ['profile'] as const;

export const getProfile = () =>
	createQuery(() => ({
		queryKey: profileQueryKey,

		queryFn: async (): Promise<ClientResult<Profile>> => {
			const result = await ClientFetch<Profile>(resolve('/api/admin/profile'), {
				method: 'GET'
			});

			if (!result.isSuccess) {
				throw new Error(result.errorMsg ?? 'Failed to load profile.');
			}

			return result;
		}
	}));
