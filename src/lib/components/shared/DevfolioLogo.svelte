<script lang="ts">
	type Size = 'sm' | 'md' | 'lg';

	let {
		size = 'md',
		showText = true,
		subtext = '',
		class: className = ''
	}: {
		size?: Size;
		showText?: boolean;
		subtext?: string;
		class?: string;
	} = $props();

	const sizes = {
		sm: { tile: 'size-8', icon: 'size-4', name: 'text-base', tag: 'text-[11px]' },
		md: { tile: 'size-10', icon: 'size-5', name: 'text-xl', tag: 'text-xs' },
		lg: { tile: 'size-14', icon: 'size-7', name: 'text-3xl', tag: 'text-sm' }
	} as const;

	const s = $derived(sizes[size]);
</script>

<div class={['flex items-center gap-3', className]}>
	<!-- Mark: </> -->
	<span
		class={[
			'flex rounded-full shrink-0 items-center justify-center bg-primary text-primary-foreground shadow-sm ring-1 ring-primary-foreground/25 ring-inset',
			s.tile
		]}
	>
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-linecap="round"
			stroke-linejoin="round"
			class={s.icon}
			aria-hidden="true"
		>
			<path d="M7.5 7 2.5 12l5 5" stroke-width="2.4" />
			<path d="m16.5 7 5 5-5 5" stroke-width="2.4" />
			<path d="m13.5 5-3 14" stroke-width="2" opacity="0.75" />
		</svg>
	</span>

	<!-- Wordmark -->
	{#if showText}
		<span class="flex min-w-0 flex-col">
			<span class={['font-serif leading-none font-bold tracking-tight text-foreground', s.name]}>
				devfolio
			</span>

			{#if subtext}
				<span class={['mt-1.5 leading-none tracking-wide text-sidebar-foreground/60', s.tag]}>
					{subtext}
				</span>
			{/if}
		</span>
	{/if}
</div>
