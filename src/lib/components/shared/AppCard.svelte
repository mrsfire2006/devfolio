<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		cover?: Snippet;
		header?: Snippet;
		body?: Snippet;
		footer?: Snippet;

		class?: string;
		coverClass?: string;
		headerClass?: string;
		bodyClass?: string;
		footerClass?: string;
	}

	let {
		cover,
		header,
		body,
		footer,
		class: className = '',
		coverClass = '',
		headerClass = '',
		bodyClass = '',
		footerClass = ''
	}: Props = $props();
</script>

<div class={`@container/card min-w-0 ${className}`}>
	{#if cover}
		<div class={coverClass}>
			{@render cover()}
		</div>
	{/if}

	{#if header}
		<div class={headerClass}>
			{@render header()}
		</div>
	{/if}

	{#if body}
		<div class={bodyClass}>
			{@render body()}
		</div>
	{/if}

	{#if footer}
		<div class={footerClass}>
			{@render footer()}
		</div>
	{/if}
</div>
