import { ClientFetch } from '#lib/client-fetch.ts';

import { resolve } from '$app/paths';
import { createQuery } from '@tanstack/svelte-query';
import type { PrivateProjectCard, PublicProjectCard } from '../dtos/project';
const root = 'projects';

type Domain = 'PUBLIC' | 'PRIVATE';
// type Include = 'FULL' | 'PARTIAL';

type ProjectCard<T extends Domain> = T extends 'PRIVATE' ? PrivateProjectCard : PublicProjectCard;

export const getProjects = <T extends Domain = 'PUBLIC'>(domain: T = 'PUBLIC' as T) =>
	createQuery(() => ({
		queryKey: [root, domain],
		queryFn: async () => {
			const params = new URLSearchParams({
				domain: domain.toLowerCase()
			});

			return await ClientFetch<ProjectCard<T>[]>(`${resolve('/api/admin/projects')}?${params}`, {
				method: 'GET'
			});
		}
	}));


export const getProject = (
	id: string | (() => string),
	domain: Domain = 'PUBLIC',
	includeFull = false
) =>
	createQuery(() => {
		const projectId = typeof id === 'function' ? id() : id;

		return {
			queryKey: [root, domain, projectId, includeFull],
			queryFn: async () => {
				const endpoint = resolve('/api/admin/projects/[id]', { id: projectId });

				return await ClientFetch<any>(includeFull ? `${endpoint}?include=full` : endpoint, {
					method: 'GET'
				});
			}
		};
	});
