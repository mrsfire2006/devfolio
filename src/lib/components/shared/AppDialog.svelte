<script lang="ts">
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import type { Snippet } from 'svelte';

	interface Props {
		trigger?: Snippet;
		header: Snippet;
		content: Snippet;
		actions?: Snippet;

		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		triggerClass?: string;
		contentClass?: string;
	}

	let {
		trigger,
		header,
		content,
		actions,
		open = $bindable(false),
		onOpenChange,
		triggerClass = '',
		contentClass = ''
	}: Props = $props();
</script>

<Dialog.Root {onOpenChange} bind:open>
	{#if trigger}
		<Dialog.Trigger class={triggerClass}>
			{@render trigger()}
		</Dialog.Trigger>
	{/if}

	<Dialog.Content class={contentClass}>
		<Dialog.Header>
			{@render header()}
		</Dialog.Header>

		{@render content()}

		{#if actions}
			<Dialog.Footer>
				{@render actions()}
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>
