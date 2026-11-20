<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';
	import { ModeWatcher } from 'mode-watcher';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { browser } from '$app/env';
	import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
	import { onMount } from 'svelte';
	import { theme } from '#lib/theme.svelte.ts';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	let { children }: LayoutProps = $props();
	let pathname = $derived(page.url.pathname);

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser,
				staleTime: 60_000,
				gcTime: 5 * 60_000,
				retry: 1,
				refetchOnWindowFocus: false
			}
		}
	});

	onMount(() => {
		if (pathname !== resolve('/')) {
			theme.init();
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<ModeWatcher defaultMode="dark" defaultTheme="warm" themeStorageKey="theme" />

<QueryClientProvider client={queryClient}>
	{@render children()}
	<SvelteQueryDevtools />
</QueryClientProvider>
