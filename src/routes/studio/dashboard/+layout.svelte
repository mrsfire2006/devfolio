<script lang="ts">
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import StudioNavbar from './studio-layout/StudioNavbar.svelte';
	import StudioSidebar from './studio-layout/StudioSidebar.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>Devfolio | Dashboard</title>
</svelte:head>

<Sidebar.Provider>
	<StudioSidebar />
	<Sidebar.Inset>
		<div class="mask">
			<StudioNavbar />
			{@render children?.()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>

<style>
	.mask {
		background:
			radial-gradient(
				circle at 80% -10%,
				color-mix(in oklab, var(--primary) 12%, transparent) 0%,
				transparent 30%
			),
			var(--background);
	}
</style>
