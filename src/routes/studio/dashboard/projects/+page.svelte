<script lang="ts">
	import { onMount } from 'svelte';

	import {
		CalendarDays,
		CircleCheck,
		CircleDot,
		FolderOpen,
		LayoutGrid,
		Search,
		X
	} from '@lucide/svelte';

	import CreateProjectDialog from './_components/CreateProjectDialog.svelte';
	import EditProjectDialog from './_components/EditProjectDialog.svelte';

	import { getProjects } from '#lib/queries/projects.ts';
	import { resolve } from '$app/paths';
	import { ClientFetch } from '#lib/client-fetch.ts';
	import { useQueryClient } from '@tanstack/svelte-query';
	import type { ProjectStatus } from '#lib/server/db/schemas/project.schema.ts';
	import StudioProjectCard from './_components/StudioProjectCard.svelte';
	import type { PrivateProjectCard } from '#lib/dtos/project/private.ts';

	type ProjectFilter = 'all' | ProjectStatus;
	const queryClient = useQueryClient();

	let dateLabel = $state('');
	let search = $state('');
	let filter = $state<ProjectFilter>('all');
	let editingProject = $state<PrivateProjectCard | null>(null);
	let deletingProjectId = $state<string | null>(null);

	const projectsQuery = getProjects('PRIVATE');
	const projects = $derived(projectsQuery.data?.value ?? []);

	onMount(() => {
		dateLabel = new Intl.DateTimeFormat('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		})
			.format(new Date())
			.toUpperCase();
	});

	const visibleProjects = $derived(
		projects.filter((project) => {
			const query = search.trim().toLowerCase();

			const matchesSearch =
				!query ||
				project.name.toLowerCase().includes(query) ||
				(project.description ?? '').toLowerCase().includes(query) ||
				(project.githubUrl ?? '').toLowerCase().includes(query);

			const matchesFilter = filter === 'all' || project.status === filter;

			return matchesSearch && matchesFilter;
		})
	);

	// ── Filter tabs (بعدّادات) ──
	const tabs = $derived([
		{
			value: 'all' as ProjectFilter,
			label: 'All',
			icon: LayoutGrid,
			count: projects.length,
			active: 'bg-primary text-primary-foreground'
		},
		{
			value: 'IN_PROGRESS' as ProjectFilter,
			label: 'In progress',
			icon: CircleDot,
			count: projects.filter((p) => p.status === 'IN_PROGRESS').length,
			active: 'bg-gold text-background'
		},
		{
			value: 'COMPLETED' as ProjectFilter,
			label: 'Completed',
			icon: CircleCheck,
			count: projects.filter((p) => p.status === 'COMPLETED').length,
			active: 'bg-blue text-background'
		}
	]);

	function openEditDialog(project: PrivateProjectCard) {
		editingProject = project;
	}

	async function deleteProject(id: string) {
		if (!id || deletingProjectId) return;

		deletingProjectId = id;

		try {
			const result = await ClientFetch(resolve('/api/admin/projects/[id]', { id }), {
				method: 'DELETE'
			});

			if (!result.isSuccess) {
				throw new Error(result.errorMsg ?? 'Failed to delete project');
			}

			await projectsQuery.refetch();
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to delete project');
		} finally {
			deletingProjectId = null;
		}
	}
</script>

<svelte:head>
	<title>Projects — Portfolio</title>
	<meta
		name="description"
		content="Explore projects, experiments, and things currently in development."
	/>
</svelte:head>

<div class="@container/projects mx-auto w-full max-w-[1600px]">
	<main
		class="min-h-dvh w-full px-5
			@sm/projects:px-6
			@2xl/projects:px-8
			@2xl/projects:pt-10
			@5xl/projects:px-10"
	>
		<!-- Header -->
		<header class="mb-8">
			<p
				class="mb-4 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-muted-foreground"
			>
				<CalendarDays class="size-3.5 text-gold" />
				{dateLabel}
			</p>

			<div
				class="flex flex-col gap-5
					@2xl/projects:flex-row
					@2xl/projects:items-center
					@2xl/projects:justify-between"
			>
				<div class="min-w-0">
					<h1
						class="text-4xl font-semibold tracking-[-0.055em] text-foreground
							@sm/projects:text-5xl"
					>
						Projects
					</h1>

					<p class="mt-3 text-sm leading-relaxed text-muted-foreground @sm/projects:text-base">
						Your portfolio is taking shape. Here's what's moving.
					</p>
				</div>

				<CreateProjectDialog />
			</div>
		</header>

		<!-- Toolbar -->
		<div
			class="mb-6 flex flex-col gap-4
				@xl/projects:flex-row
				@xl/projects:items-center
				@xl/projects:justify-between"
		>
			<div class="relative w-full max-w-sm">
				<Search
					class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-blue"
					strokeWidth={1.8}
				/>

				<input
					bind:value={search}
					type="search"
					placeholder="Search by name, description or repo…"
					aria-label="Search projects"
					class="h-10 w-full rounded-none border border-input bg-card pr-9 pl-9 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground hover:border-foreground/25 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40 [&::-webkit-search-cancel-button]:hidden"
				/>

				{#if search}
					<button
						type="button"
						onclick={() => (search = '')}
						aria-label="Clear search"
						class="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
					>
						<X class="size-3.5" />
					</button>
				{/if}
			</div>

			<div
				role="tablist"
				aria-label="Filter projects by status"
				class="flex w-fit items-center gap-1 rounded-none border border-border bg-card p-1"
			>
				{#each tabs as tab (tab.value)}
					<button
						type="button"
						role="tab"
						aria-selected={filter === tab.value}
						onclick={() => (filter = tab.value)}
						class="flex items-center gap-1.5 rounded-none px-3 py-1.5 text-xs font-medium transition-colors
							{filter === tab.value ? tab.active : 'text-muted-foreground hover:bg-accent hover:text-foreground'}"
					>
						<tab.icon class="size-3.5" strokeWidth={2} />
						{tab.label}
						<span
							class="min-w-4 px-1 text-center text-[10px] font-semibold tabular-nums
								{filter === tab.value ? 'bg-background/25' : 'bg-muted'}"
						>
							{tab.count}
						</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- List -->
		{#if projectsQuery.isPending}
			<section
				aria-busy="true"
				class="grid grid-cols-1 gap-5 @3xl/projects:grid-cols-2 @5xl/projects:gap-6"
			>
				{#each { length: 4 }, i (i)}
					<div class="h-80 animate-pulse rounded-none border border-border bg-card"></div>
				{/each}
			</section>
		{:else if projectsQuery.isError}
			<div
				class="flex min-h-64 flex-col items-center justify-center gap-3 border border-destructive/30 bg-destructive/5 text-center"
			>
				<p class="text-sm text-destructive">Failed to load projects.</p>
				<button
					type="button"
					onclick={() => projectsQuery.refetch()}
					class="rounded-none border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
				>
					Try again
				</button>
			</div>
		{:else if visibleProjects.length > 0}
			<section
				aria-label="Projects"
				class="grid grid-cols-1 gap-5
					@3xl/projects:grid-cols-2
					@5xl/projects:gap-6"
			>
				{#each visibleProjects as project (project.id)}
					<StudioProjectCard
						loading={deletingProjectId === project.id}
						{project}
						onEdit={openEditDialog}
						onDelete={deleteProject}
					/>
				{/each}
			</section>
		{:else}
			<div
				class="flex min-h-64 flex-col items-center justify-center
					border border-dashed border-border px-6 text-center"
			>
				<span class="mb-4 flex size-14 items-center justify-center bg-violet/15 text-violet">
					<FolderOpen class="size-7" strokeWidth={1.4} />
				</span>

				<h2 class="text-base font-medium text-foreground">No projects found</h2>

				<p class="mt-2 max-w-sm text-sm text-muted-foreground">
					{projects.length === 0
						? 'Create your first project to get started.'
						: 'Try another search or filter.'}
				</p>

				{#if projects.length > 0}
					<button
						type="button"
						onclick={() => {
							search = '';
							filter = 'all';
						}}
						class="mt-4 inline-flex items-center gap-1.5 rounded-none bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
					>
						<X class="size-3.5" />
						Clear filters
					</button>
				{/if}
			</div>
		{/if}
	</main>
</div>

<!-- Edit dialog only -->
{#if editingProject}
	<EditProjectDialog
		project={editingProject}
		open={true}
		onClose={() => (editingProject = null)}
		onUpdated={async () => {
			await projectsQuery.refetch();
			await queryClient.invalidateQueries({
				queryKey: ['projects', 'PRIVATE', editingProject?.id]
			});
		}}
	/>
{/if}
