<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		id,
		label,
		hint,
		children
	}: {
		id: string;
		label: string;
		hint?: string;
		children: Snippet;
	} = $props();
</script>

<div class="min-w-0 space-y-2">
	<label
		for={id}
		class="block font-mono text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase"
	>
		{label}
	</label>

	{@render children()}

	{#if hint}
		<p class="border-l-2 border-primary/30 pl-2 text-xs leading-relaxed text-muted-foreground">
			{hint}
		</p>
	{/if}
</div>
