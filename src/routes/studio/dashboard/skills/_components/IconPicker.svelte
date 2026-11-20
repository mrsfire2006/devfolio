<!-- src/lib/components/skills/IconPicker.svelte -->
<script lang="ts">
	import { ChevronDown } from '@lucide/svelte';
	import { Button, buttonVariants } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Popover from '#lib/components/ui/popover/index.js';

	import { iconMap, iconNames } from './lucide-icons.ts';

	let { value = $bindable(null) }: { value?: string | null } = $props();

	const PAGE = 120;

	let open = $state(false);
	let search = $state('');
	let limit = $state(PAGE);

	const matches = $derived.by(() => {
		const q = search.trim().toLowerCase();
		return q ? iconNames.filter((n) => n.toLowerCase().includes(q)) : iconNames;
	});
	const visible = $derived(matches.slice(0, limit));
	const Selected = $derived(value ? iconMap[value] : undefined);

	function pick(name: string) {
		value = name;
		open = false;
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		type="button"
		class="{buttonVariants({ variant: 'outline' })} w-full justify-between font-normal"
	>
		<span class="flex min-w-0 items-center gap-2">
			{#if Selected}
				<Selected class="size-4 shrink-0" />
				<span class="truncate">{value}</span>
			{:else}
				<span class="text-muted-foreground">Choose icon</span>
			{/if}
		</span>
		<ChevronDown class="size-4 shrink-0 text-muted-foreground" />
	</Popover.Trigger>

	<Popover.Content align="start" class="w-80 space-y-3 p-3">
		<Input
			bind:value={search}
			oninput={() => (limit = PAGE)}
			placeholder="Search {iconNames.length} icons…"
		/>

		<div class="grid max-h-64 grid-cols-6 gap-1 overflow-y-auto">
			{#each visible as name (name)}
				{@const Icon = iconMap[name]}
				<button
					type="button"
					title={name}
					onclick={() => pick(name)}
					class="flex aspect-square items-center justify-center rounded-md transition
						{value === name
						? 'bg-primary text-primary-foreground'
						: 'text-muted-foreground hover:bg-accent hover:text-foreground'}"
				>
					<Icon class="size-5" />
				</button>
			{:else}
				<p class="col-span-6 py-6 text-center text-sm text-muted-foreground">No icons found</p>
			{/each}
		</div>

		<div class="flex items-center justify-between text-xs text-muted-foreground">
			<span>{visible.length} / {matches.length}</span>
			<div class="flex gap-1">
				{#if visible.length < matches.length}
					<Button type="button" variant="ghost" size="sm" onclick={() => (limit += PAGE)}>
						Show more
					</Button>
				{/if}
				{#if value}
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onclick={() => {
							value = null;
							open = false;
						}}
					>
						Clear
					</Button>
				{/if}
			</div>
		</div>
	</Popover.Content>
</Popover.Root>
