<script lang="ts">
	import { onMount } from 'svelte';
	import { CalendarDays, FolderOpen, Plus, Search, X } from '@lucide/svelte';

	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Skeleton } from '#lib/components/ui/skeleton/index.js';

	import { getSkills, useDeleteSkill } from '#lib/queries/skills.ts';

	import CreateSkillDialog from './_components/CreateSkillDialog.svelte';
	import SkillCard from './_components/SkillCard.svelte';

	let dateLabel = $state('');
	let search = $state('');
	let createSkillOpen = $state(false);

	const skills = getSkills();
	const deleteSkill = useDeleteSkill();

	const list = $derived(skills.data?.value ?? []);

	const filtered = $derived.by(() => {
		const query = search.trim().toLowerCase();

		return list.filter(
			(skill) =>
				skill.name.toLowerCase().includes(query) ||
				(skill.description ?? '').toLowerCase().includes(query)
		);
	});

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
</script>


<svelte:head>
	<title>Skills — Portfolio</title>
	<meta
		name="description"
		content="Manage the technologies, tools, and skills displayed on your portfolio."
	/>
</svelte:head>

<div class="@container/skills mx-auto w-full max-w-[1600px]">
	<main
		class="min-h-dvh w-full px-5
			@sm/skills:px-6
			@2xl/skills:px-8
			@2xl/skills:pt-10
			@5xl/skills:px-10"
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
					@2xl/skills:flex-row
					@2xl/skills:items-center
					@2xl/skills:justify-between"
			>
				<div class="min-w-0">
					<h1
						class="text-4xl font-semibold tracking-[-0.055em] text-foreground
							@sm/skills:text-5xl"
					>
						Skills<span class="text-primary">.</span>
					</h1>

					<p class="mt-3 text-sm leading-relaxed text-muted-foreground @sm/skills:text-base">
						The tools and technologies behind your work.
					</p>
				</div>

				<CreateSkillDialog bind:open={createSkillOpen} />
			</div>
		</header>

		<!-- Search toolbar -->
		<div
			class="mb-6 flex flex-col gap-4
				@xl/skills:flex-row
				@xl/skills:items-center
				@xl/skills:justify-between"
		>
			<div class="relative w-full max-w-sm">
				<Search
					class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-blue"
					strokeWidth={1.8}
				/>

				<Input
					bind:value={search}
					type="search"
					placeholder="Search by name or description…"
					aria-label="Search skills"
					class="h-10 rounded-none border-input bg-card pr-9 pl-9 text-sm outline-none placeholder:text-muted-foreground hover:border-foreground/25 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40 [&::-webkit-search-cancel-button]:hidden"
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

			{#if skills.isSuccess}
				<p class="text-xs text-muted-foreground tabular-nums">
					{#if search.trim()}
						<span class="text-foreground">{filtered.length}</span>
						of {list.length} skills
					{:else}
						<span class="text-foreground">{list.length}</span>
						{list.length === 1 ? 'skill' : 'skills'}
					{/if}
				</p>
			{/if}
		</div>

		<!-- Skills list -->
		{#if skills.isPending}
			<section
				aria-label="Loading skills"
				aria-busy="true"
				class="grid grid-cols-1 gap-5 @sm/skills:grid-cols-2 @5xl/skills:gap-6"
			>
				{#each { length: 4 }, i (i)}
					<Skeleton class="h-36 rounded-none" />
				{/each}
			</section>
		{:else if skills.isError}
			<div
				class="flex min-h-64 flex-col items-center justify-center gap-3 border border-destructive/30 bg-destructive/5 text-center"
			>
				<p class="text-sm text-destructive">Failed to load skills.</p>

				<Button
					type="button"
					variant="outline"
					class="rounded-none"
					onclick={() => skills.refetch()}
				>
					Try again
				</Button>
			</div>
		{:else if filtered.length > 0}
			<section
				aria-label="Skills"
				class="grid grid-cols-1 gap-5 @sm/skills:grid-cols-2 @5xl/skills:gap-6"
			>
				{#each filtered as skill (skill.id)}
					<SkillCard {skill} onDelete={(id) => deleteSkill.mutate(id)} />
				{/each}
			</section>
		{:else}
			<div
				class="flex min-h-64 flex-col items-center justify-center border border-dashed border-border px-6 text-center"
			>
				<span class="mb-4 flex size-14 items-center justify-center bg-violet/15 text-violet">
					<FolderOpen class="size-7" strokeWidth={1.4} />
				</span>

				<h2 class="text-base font-medium text-foreground">No skills found</h2>

				<p class="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
					{list.length === 0
						? 'Your skills list is empty. Add your first skill to get started.'
						: 'No skills match your search. Try a different keyword.'}
				</p>

				{#if list.length > 0}
					<button
						type="button"
						onclick={() => (search = '')}
						class="mt-4 inline-flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
					>
						<X class="size-3.5" />
						Clear search
					</button>
				{:else}
					<button
						type="button"
						onclick={() => (createSkillOpen = true)}
						class="mt-4 inline-flex items-center gap-1.5 bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:brightness-110"
					>
						<Plus class="size-4" />
						Add your first skill
					</button>
				{/if}
			</div>
		{/if}
	</main>
</div>

