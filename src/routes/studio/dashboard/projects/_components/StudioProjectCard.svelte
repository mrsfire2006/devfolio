<script lang="ts">
	import AppCard from '#lib/components/shared/AppCard.svelte';
	import {
		CircleCheck,
		CircleDot,
		Ellipsis,
		ExternalLink,
		LoaderCircle,
		Pencil,
		Trash2
	} from '@lucide/svelte';
	import SkillIcon from '../../skills/_components/SkillIcon.svelte';
	import { resolve } from '$app/paths';
	import type { PrivateProjectCard } from '#lib/dtos/project/private.ts';
	import type { ProjectStatus } from '#lib/dtos/project/index.ts';

	interface Props {
		project: PrivateProjectCard;
		onEdit: (project: PrivateProjectCard) => void;
		onDelete: (id: string) => void;
		loading?: boolean;
	}

	let { project, onEdit, onDelete, loading = false }: Props = $props();

	const statusMap: Record<
		NonNullable<ProjectStatus>,
		{ label: string; icon: typeof CircleDot; cls: string }
	> = {
		IN_PROGRESS: { label: 'In progress', icon: CircleDot, cls: 'bg-gold/20 text-gold' },
		COMPLETED: { label: 'Completed', icon: CircleCheck, cls: 'bg-blue/20 text-blue' }
	};

	const status = $derived(project.status ? statusMap[project.status] : null);

	const MAX_SKILLS = 4;
	const shownSkills = $derived(project.skills.slice(0, MAX_SKILLS));
	const extra = $derived(project.skills.length - MAX_SKILLS);

	let menuOpen = $state(false);

	const menuItem =
		'flex w-full items-center gap-2.5 rounded-none px-3 py-2 text-left text-xs transition-colors hover:bg-accent';
</script>

<AppCard
	class="group overflow-hidden rounded-none border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
>
	{#snippet cover()}
		<div
			class="relative flex h-44 items-center justify-center overflow-hidden bg-linear-to-br from-primary/30 via-violet/20 to-blue/25 @sm/card:h-48"
		>
			<!-- glow -->
			<span
				class="pointer-events-none absolute -top-10 -left-10 size-40 rounded-full bg-primary/25 blur-3xl"
			></span>
			<span
				class="pointer-events-none absolute -right-10 -bottom-10 size-40 rounded-full bg-blue/25 blur-3xl"
			></span>

			{#if loading}
				<div
					class="absolute inset-0 z-30 flex items-center justify-center bg-background/70 backdrop-blur-sm"
				>
					<LoaderCircle class="size-8 animate-spin text-primary" strokeWidth={1.5} />
				</div>
			{/if}

			{#if project.image !== null}
				<a
					href={resolve('/studio/dashboard/projects/[id]', { id: project.id })}
					aria-label={`View ${project.name}`}
					class="absolute inset-0 z-1"
				>
					<img
						src={project.image.url}
						alt={project.name}
						class="size-full object-cover transition-transform duration-500 group-hover:scale-105"
					/>
				</a>

				<span
					class="pointer-events-none absolute inset-0 z-2 bg-linear-to-t from-background/60 via-transparent to-transparent"
				></span>
			{:else}
				<a
					href={resolve('/studio/dashboard/projects/[id]', { id: project.id })}
					class="relative z-1 text-[44px] font-semibold tracking-[-0.06em] text-foreground/70 select-none @sm/card:text-5xl"
					aria-label={`View ${project.name}`}
				>
					{project.name.slice(0, 2).toUpperCase()}
				</a>
			{/if}

			<!-- Status -->
			{#if status}
				<span
					class="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold backdrop-blur-md {status.cls}"
				>
					<status.icon class="size-3" strokeWidth={2.4} />
					{status.label}
				</span>
			{/if}

			<!-- Menu -->
			<details class="absolute top-3 right-3 z-20" bind:open={menuOpen}>
				<summary
					aria-label={`Actions for ${project.name}`}
					class="flex size-8 cursor-pointer list-none items-center justify-center bg-background/60 text-foreground backdrop-blur-md transition-colors hover:bg-primary hover:text-primary-foreground [&::-webkit-details-marker]:hidden"
				>
					<Ellipsis class="size-5" />
				</summary>

				<div
					class="absolute top-9 right-0 z-20 w-48 rounded-none border border-border bg-popover p-1 text-popover-foreground shadow-lg"
				>
					<button
						type="button"
						onclick={() => {
							menuOpen = false;
							onEdit(project);
						}}
						class={menuItem}
					>
						<Pencil class="size-3.5 text-violet" />
						Edit project
					</button>

					{#if project.githubUrl}
						<a href={project.githubUrl} target="_blank" rel="noopener noreferrer" class={menuItem}>
							<ExternalLink class="size-3.5 text-blue" />
							View repository
						</a>
					{/if}

					<div class="my-1 border-t border-border"></div>

					<button
						type="button"
						onclick={() => {
							menuOpen = false;
							onDelete(project.id);
						}}
						class="{menuItem} text-destructive hover:bg-destructive/10"
					>
						<Trash2 class="size-3.5" />
						Delete project
					</button>
				</div>
			</details>
		</div>
	{/snippet}

	{#snippet body()}
		<div class="p-4 @sm/card:p-4.5">
			<h2
				class="min-w-0 text-[15px] font-semibold tracking-tight wrap-break-word text-card-foreground"
			>
				<a
					href={resolve('/studio/dashboard/projects/[id]', { id: project.id })}
					class="block min-w-0 text-[15px] font-semibold tracking-tight wrap-break-word text-card-foreground transition-colors hover:text-primary"
				>
					{project.name}
				</a>
			</h2>

			<p class="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground @sm/card:text-[13px]">
				{project.description || 'No description provided.'}
			</p>
			<div
				class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground"
			>
				<span>
					Created:
					{new Date(project.createdAt).toLocaleDateString('en-US', {
						day: 'numeric',
						month: 'short',
						year: 'numeric'
					})}
				</span>

				<span>
					Updated:
					{new Date(project.updatedAt).toLocaleDateString('en-US', {
						day: 'numeric',
						month: 'short',
						year: 'numeric'
					})}
				</span>
			</div>
		</div>
	{/snippet}

	{#snippet footer()}
		<div
			class="flex items-end justify-between gap-3 border-t border-border/60 px-4 py-3 @sm/card:px-4.5"
		>
			<div class="flex min-w-0 flex-wrap gap-1.5">
				{#each shownSkills as skill (skill.id)}
					<span
						class="inline-flex items-center gap-1 rounded-none bg-secondary py-0.5 pr-2 pl-1 font-mono text-[10px] text-secondary-foreground"
					>
						<span class="flex size-4 items-center justify-center bg-primary/15 text-primary">
							<SkillIcon name={skill.icon} fallback={skill.name} class="size-2.5" />
						</span>
						{skill.name}
					</span>
				{:else}
					<span class="text-xs text-muted-foreground">No skills yet</span>
				{/each}

				{#if extra > 0}
					<span
						class="inline-flex items-center rounded-none bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary"
					>
						+{extra}
					</span>
				{/if}
			</div>

			{#if project.githubUrl}
				<a
					href={project.githubUrl}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Open repository"
					class="flex size-7 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-blue/10 hover:text-blue"
				>
					<ExternalLink class="size-3.5" />
				</a>
			{/if}
		</div>
	{/snippet}
</AppCard>
