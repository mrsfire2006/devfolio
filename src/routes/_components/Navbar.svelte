<script lang="ts">
	import { onMount } from 'svelte';
	import { MoveDownRight, ArrowUpRight, Sparkles, X } from '@lucide/svelte';
	import { resolve } from '$app/paths';

	let isMobileOpen = $state(false);
	let isScrolled = $state(false);

	const navLinks = [
		{
			id: '#about',
			label: 'About',
			number: '01',
			accent: 'var(--color-coral)',
			mobile: 'mobile-about'
		},
		{
			id: '#work',
			label: 'Work',
			number: '02',
			accent: 'var(--color-sky)',
			mobile: 'mobile-work'
		}
	];

	onMount(() => {
		const updateScroll = () => {
			isScrolled = window.scrollY > 15;
		};

		updateScroll();
		window.addEventListener('scroll', updateScroll, { passive: true });

		return () => window.removeEventListener('scroll', updateScroll);
	});

	function closeMenu() {
		isMobileOpen = false;
	}
	function go(e: MouseEvent, id: string) {
		e.preventDefault();

		const targetId = id.startsWith('#') ? id.slice(1) : id;

		document.getElementById(targetId)?.scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});
	}
</script>

<div id="top"></div>

<header class="site-header fixed top-0 left-0 z-50 w-full">
	<!-- Full viewport glass layer -->
	<div aria-hidden="true" class="nav-glass" class:scrolled={isScrolled}></div>

	<!-- Color accent -->
	<div class="color-strip"></div>

	<nav
		class="nav-content mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12"
		aria-label="Main navigation"
	>
		<!-- Interactive Logo -->
		<a
			href={resolve('/')}
			class="-mx-1 rounded-none p-1 transition-opacity duration-200 hover:opacity-85"
			aria-label="Devfolio home"
			onclick={(e) => {
				closeMenu();
				go(e, 'top');
			}}
		>
			<div class="flex items-center gap-3">
				<!-- <M/> Logo Mark -->
				<span
					class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-1 ring-primary-foreground/25 transition-transform duration-200 ring-inset group-hover:scale-[1.04]"
					aria-hidden="true"
				>
					<span class="brand-code">
						<span>&lt;</span>

						<span>/&gt;</span>
					</span>
				</span>

				<!-- Wordmark -->
				<span class="flex min-w-0 flex-col">
					<span
						class="brand-name font-serif text-xl leading-none font-bold tracking-tight text-foreground"
					>
						devfolio
					</span>
				</span>
			</div>
		</a>

		<!-- Desktop actions -->
		<div class="desktop-actions ml-auto hidden items-center gap-2 md:flex">
			{#each navLinks as link (link.id)}
				<a
					href={link.id}
					onclick={(e) => go(e, link.id)}
					class="action-link group"
					style:--link-accent={link.accent}
				>
					<span>{link.label}</span>
				</a>
			{/each}

			<a
				href="#contact"
				onclick={(e) => {
					go(e, 'contact');
				}}
				class="talk-link group"
			>
				<span>Let's talk</span>
				<MoveDownRight size={15} strokeWidth={2.2} />
				<span class="talk-line"></span>
			</a>
		</div>

		<!-- Mobile menu -->
		<div class="relative ml-auto md:hidden">
			<button
				type="button"
				class="menu-toggle"
				class:menu-open={isMobileOpen}
				aria-expanded={isMobileOpen}
				aria-controls="mobile-navigation"
				aria-label={isMobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
				onclick={() => (isMobileOpen = !isMobileOpen)}
			>
				{#if isMobileOpen}
					Close
					<X size={17} strokeWidth={2.5} />
				{:else}
					Menu
					<MoveDownRight size={15} strokeWidth={2.2} />
				{/if}
			</button>

			{#if isMobileOpen}
				<div id="mobile-navigation" class="mobile-menu">
					<!-- Heading -->
					<div class="mobile-heading">
						<div>
							<div class="mobile-eyebrow">
								<Sparkles size={12} />
								<span>DEVFOLIO</span>
							</div>

							<p>Explore my work<span>.</span></p>
						</div>

						<span class="heading-symbol">
							<ArrowUpRight size={21} />
						</span>
					</div>

					<!-- Links -->
					<div class="mobile-links">
						{#each navLinks as link (link.id)}
							<a
								href={link.id}
								onclick={(e) => {
									closeMenu();
									go(e, link.id);
								}}
								class={`mobile-link ${link.mobile}`}
								style:--link-accent={link.accent}
							>
								<span class="mobile-number">{link.number}</span>
								<span class="mobile-link-label">{link.label}</span>
								<ArrowUpRight size={17} class="mobile-arrow" />
								<span class="mobile-link-line"></span>
							</a>
						{/each}
					</div>

					<!-- Main action -->
					<div class="mobile-footer">
						<a
							href="#contact"
							onclick={(e) => {
								closeMenu();
								go(e, 'contact');
							}}
							class="mobile-talk"
						>
							<span>Let's talk</span>
							<MoveDownRight size={17} />
							<span class="mobile-talk-line"></span>
						</a>
					</div>

					<div class="mobile-color-strip"></div>
				</div>
			{/if}
		</div>
	</nav>
</header>

<style>
	/* ───── Header ───── */

	.site-header {
		isolation: isolate;
	}

	/*
	 * Fixed independently of the centered nav.
	 * This layer always spans the viewport, including both screen edges.
	 */
	.nav-glass {
		position: fixed;
		top: 0;
		right: 0;
		left: 0;
		z-index: 0;
		width: 100%;
		height: 112px;
		opacity: 0;
		pointer-events: none;

		background: linear-gradient(
			to bottom,
			rgb(23 35 66 / 8%) 0%,
			rgb(23 35 66 / 5%) 58%,
			rgb(23 35 66 / 2%) 78%,
			transparent 100%
		);

		-webkit-backdrop-filter: blur(13px) saturate(1.08);
		backdrop-filter: blur(13px) saturate(1.08);

		-webkit-mask-image: linear-gradient(
			to bottom,
			#000 0%,
			#000 48%,
			rgb(0 0 0 / 65%) 73%,
			transparent 100%
		);
		mask-image: linear-gradient(
			to bottom,
			#000 0%,
			#000 48%,
			rgb(0 0 0 / 65%) 73%,
			transparent 100%
		);

		transition: opacity 240ms ease;
	}

	.nav-glass.scrolled {
		opacity: 1;
	}

	.color-strip {
		position: relative;
		z-index: 2;
		height: 3px;
		background: linear-gradient(
			90deg,
			var(--color-coral),
			var(--color-yellow),
			var(--color-sky),
			var(--color-mint),
			var(--color-purple)
		);
	}

	.nav-content {
		position: relative;
		z-index: 2;
	}
	.brand-code {
		display: inline-flex;
		align-items: center;
		gap: 1px;
		font-family: var(--font-mono);
		font-size: 11px;
		font-weight: 700;
		line-height: 1;
		letter-spacing: -0.08em;
	}

	.brand-code > span:first-child {
		opacity: 0.7;
	}

	a:hover .brand-name {
		color: var(--primary);
	}

	@media (prefers-reduced-motion: reduce) {
		.brand-m,
		.brand-name {
			transition: none;
		}
	}

	/* ───── Desktop actions ───── */

	.desktop-actions {
		gap: 5px;
	}

	.action-link {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 9px;
		padding: 12px 14px;

		color: var(--color-navy);
		font-size: 12px;
		font-weight: 700;
		text-decoration: none;
		transition: background-color 180ms ease;
	}
	.action-link::after {
		content: '';
		position: absolute;
		bottom: 5px;
		left: 14px;
		right: 14px;
		height: 2px;
		border-radius: 2px;
		background: var(--link-accent, black);

		transform: scaleX(0);
		transform-origin: left;
		transition: transform 300ms ease;
	}
	.action-link:hover::after,
	.action-link:focus-visible::after {
		transform: scaleX(1);
	}

	.action-dot {
		width: 6px;
		height: 6px;
		flex-shrink: 0;
		border-radius: 50%;
		background: var(--link-accent);
		transition: transform 180ms ease;
	}

	/* Actual animated underline */

	.talk-line {
		position: absolute;
		right: 14px;
		bottom: 6px;
		left: 14px;
		height: 2px;
		border-radius: 99px;
		background: var(--link-accent, var(--color-yellow));
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 250ms cubic-bezier(0.2, 0.7, 0.2, 1);
	}

	.action-link:hover,
	.action-link:focus-visible,
	.talk-link:hover .talk-line,
	.talk-link:focus-visible .talk-line {
		transform: scaleX(1);
	}

	.talk-link {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 12px;
		margin-left: 7px;
		padding: 11px 16px;
		border-radius: 999px;
		background: var(--color-navy);
		color: var(--color-paper);
		font-size: 12px;
		font-weight: 750;
		text-decoration: none;
		transition:
			background-color 200ms ease,
			color 200ms ease;
	}

	.talk-link:hover {
		background: var(--color-navy);
		color: var(--color-paper);
	}

	.talk-line {
		right: 44px;
		bottom: 6px;
		left: 16px;
		background: var(--color-yellow);
	}

	/* Keyboard accessibility */
	.action-link:focus-visible,
	.talk-link:focus-visible,
	.menu-toggle:focus-visible,
	.mobile-link:focus-visible,
	.mobile-talk:focus-visible {
		outline: 2px solid var(--color-purple);
		outline-offset: 3px;
	}

	/* ───── Mobile toggle ───── */

	.menu-toggle {
		display: inline-flex;
		min-height: 42px;
		align-items: center;
		justify-content: center;
		gap: 9px;
		padding: 0 15px;
		border-radius: 999px;
		background: rgb(255 128 110 / 85%);
		color: var(--color-navy);
		font-size: 12px;
		font-weight: 750;
		transition:
			background-color 180ms ease,
			color 180ms ease;
	}

	.menu-toggle:hover {
		background: var(--color-yellow);
	}

	.menu-toggle.menu-open {
		background: var(--color-navy);
		color: var(--color-paper);
	}

	/* ───── Mobile menu ───── */

	.mobile-menu {
		position: absolute;
		top: 100%;
		right: 0;
		z-index: 60;
		width: min(300px, calc(100vw - 32px));
		margin-top: 12px;
		overflow: hidden;
		border-radius: 17px;

		background: rgb(255 217 79 / 52%);
		-webkit-backdrop-filter: blur(22px) saturate(1.2);
		backdrop-filter: blur(22px) saturate(1.2);

		box-shadow: 0 12px 32px rgb(23 35 66 / 12%);
		animation: menu-in 180ms ease-out both;
	}

	.mobile-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 18px;
		background: rgb(23 35 66 / 93%);
		color: white;
	}

	.mobile-eyebrow {
		display: flex;
		align-items: center;
		gap: 7px;
		color: white;
		font: 750 9px/1 var(--font-mono);
		letter-spacing: 0.17em;
	}

	.mobile-heading p {
		margin: 9px 0 0;
		font-size: 18px;
		font-weight: 850;
		letter-spacing: -0.035em;
	}

	.mobile-heading p span {
		color: var(--color-coral);
	}

	.heading-symbol {
		display: grid;
		width: 36px;
		height: 36px;
		flex-shrink: 0;
		place-items: center;
		border-radius: 12px;
		background: var(--color-yellow);
		color: var(--color-navy);
		transition: transform 180ms ease;
	}

	.heading-symbol:hover {
		transform: rotate(8deg);
	}

	.mobile-links {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 10px;
		background: rgb(255 128 110 / 12%);
	}

	.mobile-link {
		position: relative;
		display: flex;
		min-height: 47px;
		align-items: center;
		gap: 12px;
		padding: 10px 11px;
		border-radius: 10px;
		color: var(--color-navy);
		text-decoration: none;
		transition: background-color 180ms ease;
	}

	.mobile-about {
		background: rgb(255 128 110 / 21%);
	}

	.mobile-work {
		background: rgb(107 200 232 / 25%);
	}

	.mobile-link:hover {
		background: rgb(255 253 248 / 50%);
	}

	.mobile-number {
		min-width: 24px;
		color: var(--link-accent);
		font: 750 10px/1 var(--font-mono);
	}

	.mobile-link-label {
		flex: 1;
		font-size: 13px;
		font-weight: 750;
	}

	.mobile-arrow {
		flex-shrink: 0;
		color: var(--color-navy);
		transition: transform 180ms ease;
	}

	/* Mobile links also get a real animated underline */
	.mobile-link-line {
		position: absolute;
		right: 39px;
		bottom: 7px;
		left: 47px;
		height: 2px;
		border-radius: 99px;
		background: var(--link-accent);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 250ms ease;
	}

	.mobile-link:hover .mobile-link-line,
	.mobile-link:focus-visible .mobile-link-line {
		transform: scaleX(1);
	}

	.mobile-footer {
		padding: 0 10px 11px;
		background: rgb(255 128 110 / 12%);
	}

	.mobile-talk {
		position: relative;
		display: flex;
		min-height: 46px;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 0 13px;
		border-radius: 10px;
		background: rgb(255 217 79 / 94%);
		color: var(--color-navy);
		font-size: 13px;
		font-weight: 800;
		text-decoration: none;
		transition: background-color 180ms ease;
	}

	.mobile-talk:hover {
		background: var(--color-coral);
	}

	.mobile-talk-line {
		position: absolute;
		right: 39px;
		bottom: 6px;
		left: 13px;
		height: 2px;
		border-radius: 99px;
		background: var(--color-navy);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 250ms ease;
	}

	.mobile-talk:hover .mobile-talk-line,
	.mobile-talk:focus-visible .mobile-talk-line {
		transform: scaleX(1);
	}

	.mobile-color-strip {
		height: 3px;
		background: linear-gradient(
			90deg,
			var(--color-coral),
			var(--color-yellow),
			var(--color-sky),
			var(--color-mint)
		);
	}

	@keyframes menu-in {
		from {
			opacity: 0;
			transform: translateY(-5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 380px) {
		.nav-content {
			padding-right: 16px;
			padding-left: 16px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.site-header *,
		.nav-glass {
			animation: none !important;
			transition: none !important;
		}
	}
</style>
