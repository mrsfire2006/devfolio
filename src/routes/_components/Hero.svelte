<script lang="ts">
	import type { Hero } from '#lib/types/profile.ts';
	import { ArrowDown, Download } from '@lucide/svelte';

	let { hero }: { hero: Hero } = $props();

	let mx = $state(0);
	let my = $state(0);

	function onMove(e: PointerEvent) {
		const el = e.currentTarget as HTMLElement;
		const rect = el.getBoundingClientRect();

		mx = (e.clientX - rect.left) / rect.width - 0.5;
		my = (e.clientY - rect.top) / rect.height - 0.5;
	}

	function go(e: MouseEvent, id: string) {
		e.preventDefault();
		document.getElementById(id)?.scrollIntoView({
			behavior: 'smooth'
		});
	}
	function reveal(node: HTMLElement) {
		const io = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					node.classList.add('in');
					io.disconnect();
				}
			},
			{ threshold: 0.12 }
		);
		io.observe(node);
		return { destroy: () => io.disconnect() };
	}
</script>

<section
	class="hero"
	aria-label="Introduction"
	onpointermove={onMove}
	style:--mx={mx}
	style:--my={my}
>
	<div class="wrap hero-grid">
		<div class="hero-copy" use:reveal class:reveal={true}>
			<span class="badge"><i></i> Available for work</span>

			<p class="hello">HELLO, <b>I'M {hero.name.toUpperCase()}</b></p>

			<h1 class="display hero-title">
				<span>{hero.headline}</span>

				{#each hero.lines as line, i (i)}
					<span class:accent={i === 1}>
						{line}
					</span>
				{/each}
			</h1>

			<p class="lead">
				{hero.description}
			</p>

			<div class="actions">
				<a class="btn dark" href="#work" onclick={(e) => go(e, 'work')}>
					View my work <ArrowDown size={16} />
				</a>

				<a class="btn light" title="CV" href="/cv.pdf" download="Mohamed-Sarhan-Dev-CV.pdf">
					<Download size={16} />
				</a>
			</div>
		</div>

		<div class="stage select-none" aria-hidden="true">
			<span class="spark s1">✦</span>
			<span class="spark s2">✦</span>
			<span class="arrow-deco">➜</span>

			<div class="sticker db" style="--r:6deg;--d:.4s">
				<b>DB</b><small>PostgreSQL</small>
			</div>

			<div class="code-card">
				<div class="code-top"><i></i> live_workspace</div>
				<p class="k1">const product = build();</p>
				<p class="k2">await api.ship();</p>
				<p class="k3">// make something useful</p>
				<span class="dot"></span>
			</div>

			<div class="sticker api" style="--r:-7deg;--d:1s">
				<b>API</b><small>● online</small>
			</div>

			<p class="note">frontend<br />+ backend<br />→ shipped</p>
		</div>
	</div>
</section>

<style>
	.hero {
		position: relative;
		border-bottom: var(--bd);
		background-color: var(--c1);
		background-image: radial-gradient(
			color-mix(in oklab, var(--ink) 14%, transparent) 1.5px,
			transparent 1.5px
		);
		background-size: 22px 22px;
		overflow: hidden;
	}
	.hero-grid {
		display: grid;
		grid-template-columns: 1.05fr;
		align-items: center;
		gap: 32px;
		padding: clamp(100px, 8vw, 130px) clamp(20px, 5vw, 72px) clamp(64px, 9vw, 120px);
		max-width: 1324px;
	}
	.note {
		position: absolute;
		right: 2%;
		bottom: 2%;
		margin: 0;
		font-size: 17px;
		font-style: italic;
		font-weight: 600;
		line-height: 1.25;
		color: var(--violet);
		transform: rotate(6deg);
	}
	.hello {
		margin: 22px 0 10px;
		font: 500 12px/1 var(--font-mono);
		letter-spacing: 0.08em;
	}

	.hero-title {
		font-size: clamp(54px, 8.6vw, 112px);
	}
	.hero-title span {
		display: block;
	}
	.hero-title .accent {
		color: var(--accent);
	}

	.lead {
		max-width: 430px;
		margin: 26px 0 28px;
		font-size: 15px;
		font-weight: 500;
		line-height: 1.6;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 14px;
	}
	/* buttons */
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		padding: 14px 20px;
		border: var(--bd);
		border-radius: 12px;
		box-shadow: 4px 4px 0 var(--ink);
		font: 800 11px/1 var(--font-mono);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		text-decoration: none;
		cursor: pointer;
		transition:
			transform 0.15s,
			box-shadow 0.15s;
	}
	.btn:hover {
		transform: translate(2px, 2px);
		box-shadow: 2px 2px 0 var(--ink);
	}
	.btn:active {
		transform: translate(4px, 4px);
		box-shadow: 0 0 0 var(--ink);
	}
	.btn.dark {
		background: var(--ink);
		color: var(--paper);
	}
	.btn.light {
		background: var(--paper);
		color: var(--ink);
	}
	.stage {
		position: relative;
		min-height: 400px;
	}
	.sticker {
		position: absolute;
		z-index: 3;
		display: grid;
		gap: 2px;
		padding: 8px 12px;
		border: var(--bd);
		border-radius: 12px;
		background: var(--paper);
		box-shadow: 4px 4px 0 var(--ink);
		transform: rotate(var(--r));
		animation: bob 4s ease-in-out infinite;
		animation-delay: var(--d, 0s);
	}
	.sticker b {
		font-size: 20px;
		font-weight: 900;
		letter-spacing: -0.04em;
		line-height: 1;
	}
	.sticker small {
		font: 700 8px/1 var(--font-mono);
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	.sticker.db {
		top: 2%;
		right: 0;
	}
	.sticker.db b {
		color: var(--violet);
	}
	.sticker.api {
		bottom: 18%;
		left: 0;
	}
	.sticker.api b {
		color: var(--accent);
	}
	.sticker.api small {
		color: var(--blue-d);
	}

	.spark {
		position: absolute;
		color: var(--accent);
		font-size: 28px;
		animation: spin 9s linear infinite;
	}
	.spark.s1 {
		top: 0;
		left: 16%;
	}
	.spark.s2 {
		right: 8%;
		bottom: 22%;
		color: var(--violet);
		font-size: 20px;
	}
	.code-card {
		position: absolute;
		inset: 12% 4% auto 6%;
		padding: 22px 24px 28px;
		border: var(--bd);
		border-radius: var(--r);
		background: var(--paper);
		box-shadow: var(--sh-lg);
		font: 500 14px/1.9 var(--font-mono);
		transform: rotate(-5deg) translate(calc(var(--mx, 0) * -16px), calc(var(--my, 0) * -12px));
		transition: transform 0.2s ease-out;
	}
	.code-card p {
		margin: 0;
	}
	.code-top {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 14px;
		padding-bottom: 12px;
		border-bottom: var(--bd);
		font-size: 12px;
	}
	.code-top i {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--accent);
	}

	.k1 {
		color: var(--accent);
	}
	.k2 {
		color: var(--blue-d);
	}
	.k3 {
		color: var(--gold-d);
	}
	.code-card .dot {
		position: absolute;
		right: 16px;
		bottom: 14px;
		width: 22px;
		height: 22px;
		border: 2px solid var(--ink);
		border-radius: 50%;
		background: var(--c3);
	}
	@media (width >= 64rem /* 1024px */) {
		.hero-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.stage {
			min-height: 340px;
		}
	}
</style>
