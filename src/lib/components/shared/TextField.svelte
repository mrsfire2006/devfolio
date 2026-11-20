<script lang="ts">
	import { Eye, EyeOff } from '@lucide/svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	let {
		value = $bindable(''),
		type = 'text',
		leading,
		class: className = '',
		...rest
	}: HTMLInputAttributes & { leading?: string } = $props();

	let show = $state(false);
	const isPassword = $derived(type === 'password');
	const inputType = $derived(isPassword && show ? 'text' : type);
</script>

<div class="relative flex items-center">
	{#if leading}
		<span
			class="pointer-events-none absolute left-3.5 font-mono text-sm text-muted-foreground select-none"
		>
			{leading}
		</span>
	{/if}

	<input
		{...rest}
		bind:value
		type={inputType}
		class="h-11 w-full rounded-lg border border-border bg-sidebar text-sm text-foreground transition-all outline-none placeholder:text-muted-foreground/50 hover:border-foreground/25 focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50 {leading
			? 'pl-8'
			: 'pl-3.5'} {isPassword ? 'pr-11' : 'pr-3.5'} {className}"
	/>

	{#if isPassword}
		<button
			type="button"
			tabindex="-1"
			onclick={() => (show = !show)}
			aria-label={show ? 'Hide password' : 'Show password'}
			class="absolute right-2 flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
		>
			{#if show}
				<EyeOff class="size-4" />
			{:else}
				<Eye class="size-4" />
			{/if}
		</button>
	{/if}
</div>
