<!-- src/routes/(admin)/dashboard/projects/_components/SkillPicker.svelte -->
<script lang="ts">
	import { BadgeCheck, Check, ChevronDown, PackageOpen, Search, X } from '@lucide/svelte';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Popover from '#lib/components/ui/popover/index.js';
	import type { SkillCard } from '#lib/dtos/skill.ts';
	import SkillIcon from '../../skills/_components/SkillIcon.svelte';

	interface Props {
		skills: SkillCard[];
		excludeIds?: string[];
		value?: string[];
		loading?: boolean;
	}

	let { skills, excludeIds = [], value = $bindable([]), loading = false }: Props = $props();

	const PAGE = 50;

	// 4 ألوان من الـ theme، بتتوزع ثابتة على حسب الاسم
	const tiles = [
		'bg-primary/15 text-primary',
		'bg-blue/15 text-blue',
		'bg-violet/15 text-violet',
		'bg-gold/15 text-gold'
	];
	const tileFor = (name: string) => {
		let sum = 0;
		for (const ch of name) sum += ch.charCodeAt(0);
		return tiles[sum % tiles.length];
	};

	let open = $state(false);
	let search = $state('');
	let limit = $state(PAGE);

	const available = $derived(skills.filter((s) => !excludeIds.includes(s.id)));
	const matches = $derived.by(() => {
		const q = search.trim().toLowerCase();
		return q
			? available.filter(
					(s) => s.name.toLowerCase().includes(q) || (s.description ?? '').toLowerCase().includes(q)
				)
			: available;
	});
	const visible = $derived(matches.slice(0, limit));

	function toggle(id: string) {
		value = value.includes(id) ? value.filter((x) => x !== id) : [...value, id];
	}

	// infinite scroll: حمّل دفعة جديدة لما توصل لآخر القائمة
	function onScroll(e: Event) {
		const el = e.currentTarget as HTMLElement;
		if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40 && limit < matches.length) {
			limit += PAGE;
		}
	}

	$effect(() => {
		if (!open) {
			search = '';
			limit = PAGE;
		}
	});
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		type="button"
		class="group flex w-full items-center gap-2.5 rounded-none border border-input bg-background px-3 py-2.5 text-sm transition-colors outline-none hover:border-foreground/25 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40 data-[state=open]:border-primary"
	>
		<BadgeCheck class="size-4 shrink-0 text-blue" />

		<span class="flex-1 text-left {value.length ? 'text-foreground' : 'text-muted-foreground'}">
			{value.length ? `${value.length} selected` : 'Add skills'}
		</span>

		{#if value.length}
			<span
				class="flex h-5 min-w-5 items-center justify-center bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground tabular-nums"
			>
				{value.length}
			</span>
		{/if}

		<ChevronDown
			class="size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
		/>
	</Popover.Trigger>

	<Popover.Content
		align="start"
		class="w-(--bits-popover-anchor-width) min-w-72 space-y-2 rounded-none p-2"
	>
		<div class="relative">
			<Search
				class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-blue"
			/>
			<Input
				bind:value={search}
				oninput={() => (limit = PAGE)}
				placeholder="Search {available.length} skills…"
				class="h-9 rounded-none pl-8"
			/>
		</div>

		<div class="max-h-64 space-y-0.5 overflow-y-auto" onscroll={onScroll}>
			{#each visible as skill (skill.id)}
				{@const selected = value.includes(skill.id)}
				<button
					type="button"
					aria-pressed={selected}
					onclick={() => toggle(skill.id)}
					class="group/item flex w-full items-center gap-2.5 rounded-none px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent
						{selected ? 'bg-primary/10' : ''}"
				>
					<span
						class="flex size-8 shrink-0 items-center justify-center transition-transform group-hover/item:scale-105 {tileFor(
							skill.name
						)}"
					>
						<SkillIcon name={skill.icon} fallback={skill.name} class="size-4" />
					</span>

					<span class="min-w-0 flex-1">
						<span class="block truncate font-medium">{skill.name}</span>
						{#if skill.description}
							<span class="block truncate text-xs text-muted-foreground">{skill.description}</span>
						{/if}
					</span>

					<span
						class="flex size-5 shrink-0 items-center justify-center border transition-colors
							{selected
							? 'border-primary bg-primary text-primary-foreground'
							: 'border-input text-transparent group-hover/item:border-foreground/30'}"
					>
						<Check class="size-3.5" strokeWidth={3} />
					</span>
				</button>
			{:else}
				<div
					class="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground"
				>
					<PackageOpen class="size-6 text-violet" strokeWidth={1.5} />
					{loading
						? 'Loading…'
						: available.length === 0
							? 'No more skills to add'
							: 'No skills found'}
				</div>
			{/each}
		</div>

		<div
			class="flex items-center justify-between border-t border-border pt-2 text-xs text-muted-foreground"
		>
			<span class="tabular-nums">
				{#if matches.length > 0}{visible.length} of {matches.length}{:else}&nbsp;{/if}
			</span>

			{#if value.length}
				<button
					type="button"
					onclick={() => (value = [])}
					class="inline-flex items-center gap-1 px-1.5 py-0.5 transition-colors hover:bg-destructive/10 hover:text-destructive"
				>
					<X class="size-3" />
					Clear selection
				</button>
			{/if}
		</div>
	</Popover.Content>
</Popover.Root>
