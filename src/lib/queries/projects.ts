import { ClientFetch } from '#lib/client-fetch.ts';

import { resolve } from '$app/paths';
import { createQuery } from '@tanstack/svelte-query';
import type {
	PrivateFullProject,
	PrivateProjectCard,
	PublicFullProject,
	PublicProjectCard
} from '../dtos/project';
const root = 'projects';

type Domain = 'PUBLIC' | 'PRIVATE';

type ProjectCard<T extends Domain> = T extends 'PRIVATE' ? PrivateProjectCard : PublicProjectCard;
type FullProject<T extends Domain> = T extends 'PRIVATE' ? PrivateFullProject : PublicFullProject;
export const getProjects = <T extends Domain = 'PUBLIC'>(domain: T = 'PUBLIC' as T) =>
	createQuery(() => ({
		queryKey: [root, domain],
		queryFn: async () => {
			const endpoint =
				domain === 'PRIVATE' ? resolve('/api/admin/projects') : resolve('/api/projects');

			return await ClientFetch<ProjectCard<T>[]>(endpoint, {
				method: 'GET'
			});
		}
	}));

export const getProject = <T extends Domain = 'PUBLIC'>(id: string | (() => string), domain: Domain = 'PUBLIC') =>
	createQuery(() => {
		const projectId = typeof id === 'function' ? id() : id;

		return {
			queryKey: [root, domain, projectId],

			queryFn: async () => {
				const endpoint =
					domain === 'PRIVATE'
						? resolve('/api/admin/projects/[id]', { id: projectId })
						: resolve('/api/projects/[id]', { id: projectId });

				return await ClientFetch<FullProject<T>>(endpoint, {
					method: 'GET'
				});
			}
		};
	});
