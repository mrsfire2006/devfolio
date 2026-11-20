<script lang="ts">
	import { Check, Monitor, Moon, Sun } from '@lucide/svelte';
 	import { setMode, userPrefersMode } from 'mode-watcher';
	import { theme, themes } from '#lib/theme.svelte.ts';

 

	const modes = [
		{ id: 'light', label: 'Light', icon: Sun },
		{ id: 'dark', label: 'Dark', icon: Moon },
		{ id: 'system', label: 'System', icon: Monitor }
	] as const;
</script>

<div class="space-y-5">
	<!-- Mode -->
	<div class="inline-flex rounded-lg border border-border bg-sidebar p-1">
		{#each modes as m (m.id)}
			{@const active = userPrefersMode.current === m.id}
			<button
				type="button"
				aria-pressed={active}
				onclick={() => setMode(m.id)}
				class="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors {active
					? 'bg-card text-foreground shadow-sm'
					: 'text-muted-foreground hover:text-foreground'}"
			>
				<m.icon class="size-4" />
				{m.label}
			</button>
		{/each}
	</div>

	<!-- Color theme -->
	<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
		{#each themes as t (t.id)}
			{@const active = theme.current === t.id}
			<button
				type="button"
				aria-pressed={active}
				onclick={() => theme.set(t.id)}
				class="rounded-lg border bg-background p-3 text-left transition-all outline-none focus-visible:ring-4 focus-visible:ring-primary/15 {active
					? 'border-primary ring-4 ring-primary/15'
					: 'border-border hover:border-foreground/25'}"
			>
				<div data-theme={t.id} class="flex h-12 overflow-hidden rounded-md border border-border">
					<div class="w-1/4 bg-sidebar"></div>
					<div class="flex flex-1 items-center gap-1.5 bg-background p-2">
						<div class="h-full flex-1 rounded bg-card"></div>
						<span class="size-3 shrink-0 rounded-full bg-primary"></span>
					</div>
				</div>

				<div class="mt-2.5 flex items-center justify-between">
					<span class="text-sm font-medium text-foreground">{t.label}</span>
					{#if active}<Check class="size-4 text-primary" />{/if}
				</div>
			</button>
		{/each}
	</div>
</div>
