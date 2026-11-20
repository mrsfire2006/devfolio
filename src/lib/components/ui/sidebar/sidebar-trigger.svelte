<script lang="ts">
 
	import { Button } from '#lib/components/ui/button/index.js';
	import { cn } from '#lib/utils.js';
	import { useSidebar } from './context.svelte.js';
	import type { ComponentProps } from 'svelte';
	import { PanelLeftCloseIcon, PanelLeftOpenIcon } from '@lucide/svelte';

	let {
		ref = $bindable(null),
		class: className,
		onclick,
		...restProps
	}: ComponentProps<typeof Button> & {
		onclick?: (e: MouseEvent) => void;
	} = $props();

	const sidebar = useSidebar();
	const isSidebarOpen = $derived(sidebar.open || sidebar.openMobile);
</script>

<Button
	bind:ref
	data-sidebar="trigger"
	data-slot="sidebar-trigger"
	variant="ghost"
	size="icon-sm"
	class={cn(className)}
	type="button"
	onclick={(e) => {
		onclick?.(e);
		sidebar.toggle();
	}}
	{...restProps}
>
	{#if isSidebarOpen}
		<PanelLeftCloseIcon class="cn-rtl-flip" />
	{:else}
		<PanelLeftOpenIcon class="cn-rtl-flip" />
	{/if}
	<span class="sr-only"> {isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'} </span>
</Button>
