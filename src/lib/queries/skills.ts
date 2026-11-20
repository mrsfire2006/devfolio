// src/lib/queries/skills.ts
import { ClientFetch } from '#lib/client-fetch.ts';
import type { ClientResult } from '#lib/dtos/result.ts';
import type { CreateSkill, SkillCard } from '#lib/dtos/skill.ts';

import { resolve } from '$app/paths';
import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';

const root = 'skills';

export const getSkills = () =>
	createQuery(() => ({
		queryKey: [root],
		queryFn: async () => {
			const result = await ClientFetch<SkillCard[]>(resolve('/api/admin/skill'), {
				method: 'GET'
			});

			return result;
		}
	}));

export const useCreateSkill = () => {
	const queryClient = useQueryClient();

	return createMutation(() => ({
		mutationFn: (input: CreateSkill) =>
			ClientFetch<SkillCard>(resolve('/api/admin/skill'), {
				method: 'POST',
				body: JSON.stringify(input)
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [root] })
	}));
};

export const useDeleteSkill = () => {
	const queryClient = useQueryClient();

	return createMutation(() => ({
		mutationFn: (id: string) =>
			ClientFetch<void>(`${resolve('/api/admin/skill/[id]', { id })}`, { method: 'DELETE' }),

		onMutate: async (id) => {
			await queryClient.cancelQueries({ queryKey: [root] });
			const previous = queryClient.getQueryData<ClientResult<SkillCard[]>>([root]);

			queryClient.setQueryData<ClientResult<SkillCard[]>>([root], (old) =>
				old ? { ...old, value: old.value?.filter((s) => s.id !== id) } : old
			);

			return { previous };
		},
		onError: (_err, _id, context) => {
			if (context?.previous) queryClient.setQueryData([root], context.previous);
		},
		onSettled: () => queryClient.invalidateQueries({ queryKey: [root] })
	}));
};
