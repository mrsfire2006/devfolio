<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { ArrowLeft, ArrowRight, X } from '@lucide/svelte';

	type LightboxImage = { url: string; alt?: string };

	let {
		images,
		startIndex = 0,
		label = 'Image preview',
		onclose
	}: {
		images: LightboxImage[];
		startIndex?: number;
		label?: string;
		onclose: () => void;
	} = $props();

	// The component owns the current index; the parent only decides where to start.
	let current = $state(untrack(() => startIndex));
	let direction = $state(1);

	const total = $derived(images.length);
	const hasMany = $derived(total > 1);
	const image = $derived(images[current]);

	let closeButton: HTMLButtonElement;

	function go(step: 1 | -1) {
		if (!hasMany) return;
		direction = step;
		current = (current + step + total) % total;
	}

	function onKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'Escape':
				onclose();
				break;
			case 'ArrowRight':
				go(1);
				break;
			case 'ArrowLeft':
				go(-1);
				break;
			case 'Home':
				if (hasMany) {
					direction = -1;
					current = 0;
				}
				break;
			case 'End':
				if (hasMany) {
					direction = 1;
					current = total - 1;
				}
				break;
		}
	}

	// Swipe (touch / pen / mouse drag)
	let startX: number | null = null;

	function onPointerDown(event: PointerEvent) {
		startX = event.clientX;
	}

	function onPointerUp(event: PointerEvent) {
		if (startX === null) return;

		const deltaX = event.clientX - startX;
		startX = null;

		if (Math.abs(deltaX) > 50) go(deltaX < 0 ? 1 : -1);
	}

	onMount(() => {
		const previouslyFocused = document.activeElement as HTMLElement | null;
		const previousOverflow = document.body.style.overflow;

		document.body.style.overflow = 'hidden';
		closeButton?.focus();

		return () => {
			document.body.style.overflow = previousOverflow;
			previouslyFocused?.focus?.();
		};
	});
</script>

<svelte:window onkeydown={onKeydown} />

<div class="lb" role="dialog" aria-modal="true" aria-label={label}>
	<button
		type="button"
		class="lb-backdrop"
		aria-label="Close image preview"
		tabindex="-1"
		onclick={onclose}
	></button>

	<div class="lb-top">
		<span class="lb-counter">
			{String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
		</span>

		<button
			type="button"
			class="lb-btn lb-close"
			bind:this={closeButton}
			onclick={onclose}
			aria-label="Close image preview"
		>
			<X size={22} />
		</button>
	</div>

	<div class="lb-stage">
		{#key current}
			<img
				class="lb-img"
				style:--dir={direction}
				src={image.url}
				alt={image.alt ?? `Image ${current + 1} of ${total}`}
				draggable="false"
				onpointerdown={onPointerDown}
				onpointerup={onPointerUp}
				onpointercancel={() => (startX = null)}
			/>
		{/key}
	</div>

	{#if hasMany}
		<button
			type="button"
			class="lb-btn lb-arrow lb-prev"
			onclick={() => go(-1)}
			aria-label="Previous image"
		>
			<ArrowLeft size={22} />
		</button>

		<button
			type="button"
			class="lb-btn lb-arrow lb-next"
			onclick={() => go(1)}
			aria-label="Next image"
		>
			<ArrowRight size={22} />
		</button>
	{/if}

	{#if image.alt}
		<p class="lb-caption">{image.alt}</p>
	{/if}
</div>

<style>
	.lb {
		position: fixed;
		inset: 0;
		z-index: 1000;
		display: grid;
		place-items: center;
		padding: 72px 24px 64px;
		background: color-mix(in oklab, var(--ink, #131a3c) 88%, transparent);
		backdrop-filter: blur(8px);
		animation: lb-fade 0.2s ease-out;
	}

	.lb-backdrop {
		position: absolute;
		inset: 0;
		border: 0;
		background: transparent;
		cursor: zoom-out;
	}

	.lb-top {
		position: absolute;
		top: 18px;
		right: 20px;
		left: 20px;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: space-between;
		pointer-events: none;
	}

	.lb-counter {
		padding: 9px 12px;
		border: 2px solid var(--paper, #fcf8ec);
		border-radius: 999px;
		color: var(--paper, #fcf8ec);
		font: 700 10px/1 var(--font-mono, monospace);
		letter-spacing: 0.13em;
		font-variant-numeric: tabular-nums;
	}

	.lb-stage {
		position: relative;
		z-index: 1;
		display: grid;
		place-items: center;
		max-width: 100%;
		max-height: 100%;
		pointer-events: none;
	}

	.lb-img {
		display: block;
		max-width: min(90vw, 1400px);
		max-height: calc(100vh - 150px);
		border: 2px solid var(--paper, #fcf8ec);
		border-radius: 12px;
		background: var(--paper, #fcf8ec);
		box-shadow: 8px 8px 0 var(--c1, #dfba80);
		object-fit: contain;
		pointer-events: auto;
		user-select: none;
		touch-action: pan-y;
		animation: lb-slide 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	/* Buttons — same neobrutalist language as the rest of the page */
	.lb-btn {
		display: grid;
		width: 48px;
		height: 48px;
		place-items: center;
		border: 2px solid var(--ink, #131a3c);
		border-radius: 12px;
		background: var(--paper, #fcf8ec);
		color: var(--ink, #131a3c);
		box-shadow: 4px 4px 0 var(--c1, #dfba80);
		cursor: pointer;
		pointer-events: auto;
		transition:
			transform 0.2s,
			box-shadow 0.2s,
			background 0.2s;
	}

	.lb-btn:hover {
		background: var(--c1, #dfba80);
		transform: translate(3px, 3px);
		box-shadow: 1px 1px 0 var(--c1, #dfba80);
	}

	.lb-btn:active {
		transform: translate(4px, 4px);
		box-shadow: none;
	}

	.lb-btn:focus-visible {
		outline: 3px solid var(--c3, #97bbe1);
		outline-offset: 3px;
	}

	.lb-arrow {
		position: absolute;
		top: 50%;
		z-index: 2;
		margin-top: -24px;
	}

	.lb-prev {
		left: 20px;
	}

	.lb-next {
		right: 20px;
	}

	.lb-arrow:hover {
		/* keep vertical centering while the press effect moves it */
		transform: translate(3px, 3px);
	}

	.lb-caption {
		position: absolute;
		right: 90px;
		bottom: 20px;
		left: 90px;
		z-index: 2;
		margin: 0;
		overflow: hidden;
		color: var(--paper, #fcf8ec);
		font: 700 10px/1 var(--font-mono, monospace);
		letter-spacing: 0.13em;
		text-align: center;
		text-overflow: ellipsis;
		text-transform: uppercase;
		white-space: nowrap;
		opacity: 0.75;
		pointer-events: none;
	}

	@keyframes lb-fade {
		from {
			opacity: 0;
		}
	}

	@keyframes lb-slide {
		from {
			opacity: 0;
			transform: translateX(calc(var(--dir) * 40px)) scale(0.98);
		}
	}

	@media (max-width: 600px) {
		.lb {
			padding: 70px 12px 96px;
		}

		.lb-img {
			max-width: 94vw;
			max-height: calc(100vh - 190px);
			box-shadow: 5px 5px 0 var(--c1, #dfba80);
		}

		/* arrows move below the image so they never cover it */
		.lb-arrow {
			top: auto;
			bottom: 22px;
			margin-top: 0;
		}

		.lb-prev {
			left: 24px;
		}

		.lb-next {
			right: 24px;
		}

		.lb-caption {
			right: 86px;
			bottom: 38px;
			left: 86px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.lb,
		.lb-img {
			animation: none;
		}

		.lb-btn {
			transition: none;
		}
	}
</style>
