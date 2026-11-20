<script lang="ts">
	import { iconMap } from './lucide-icons.ts';

	let {
		name,
		fallback,
		class: className = 'size-5'
	}: { name: string | null; fallback: string; class?: string } = $props();

	const Icon = $derived(name ? iconMap[name] : undefined);
</script>

{#if Icon}
	<Icon class={className} />
{:else}
	<span class="text-sm font-medium">{fallback.charAt(0).toUpperCase()}</span>
{/if}
