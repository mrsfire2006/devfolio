<script lang="ts">
	import type { Contact } from '#lib/types/profile.ts';
	import { ArrowUpRight } from '@lucide/svelte';
	const year = new Date().getFullYear();
	let { contact }: { contact: Contact } = $props();

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

<section class="sec contact" id="contact">
	<span class="deco" aria-hidden="true"></span>

	<div class="wrap">
		<div class="head reveal" use:reveal>
			<div>
				<p class="eyebrow">04 / Contact</p>
				<h2 class="display">Let's<br /><span class="paper">talk.</span></h2>
			</div>
			<p class="aside">HAVE AN IDEA, A PROJECT, OR JUST WANT TO SAY HELLO?</p>
		</div>

		<div class="open reveal" use:reveal>
			<p class="mono-row"><span>Open for</span><i></i><b>{year} ideas</b></p>
			<div class="open-row">
				<h3>Let's turn an idea into <span class="paper">something real.</span></h3>
				<span class="big-arrow" aria-hidden="true">↘</span>
			</div>
		</div>

		<ul class="rows reveal" use:reveal>
			{#each contact.links as c, i (c.id)}
				<li>
					<a
						href={c.href}
						target={c.href.startsWith('http') || c.href.endsWith('.pdf') ? '_blank' : undefined}
						rel={c.href.startsWith('http') || c.href.endsWith('.pdf')
							? 'noopener noreferrer'
							: undefined}
					>
						<span class="row-n">{String(i + 1).padStart(2, '0')}</span>
						<b>{c.label}</b>
						<span class="row-hint">{c.hint}</span>
						<ArrowUpRight size={22} />
					</a>
				</li>
			{/each}
		</ul>

		<div class="board-foot dark">
			<span>Let's make something</span>
			<span>04 / Contact</span>
			<span>{year}</span>
		</div>
	</div>
</section>

<style>
	.contact {
		background: var(--c5);
		overflow: hidden;
	}
	.deco {
		position: absolute;
		top: -40px;
		right: clamp(20px, 8vw, 120px);
		width: 120px;
		height: 120px;
		opacity: 0.55;
		transform: rotate(18deg);
	}
	.deco::before,
	.deco::after {
		content: '';
		position: absolute;
		background: var(--paper);
		border: var(--bd);
	}
	.deco::before {
		inset: 40px 0;
	}
	.deco::after {
		inset: 0 40px;
	}
	.mono-row {
		display: flex;
		align-items: center;
		gap: 14px;
		margin: 0 0 14px;
		font: 700 10px/1 var(--font-mono);
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}
	.mono-row i {
		flex: 0 0 70px;
		height: 2px;
		background: var(--ink);
	}
	.open {
		margin-bottom: 34px;
		padding-top: 22px;
		border-top: var(--bd);
	}
	.open-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
	}
	.open h3 {
		max-width: 620px;
		margin: 0;
		font-size: clamp(30px, 4.6vw, 54px);
		font-weight: 900;
		line-height: 0.95;
		letter-spacing: -0.05em;
	}
	.big-arrow {
		font-size: clamp(56px, 9vw, 110px);
		line-height: 1;
		transition: transform 0.3s;
	}
	.open:hover .big-arrow {
		transform: translate(8px, 8px);
	}
	.rows {
		margin: 0;
		padding: 0;
		border-top: var(--bd);
		list-style: none;
	}
	.rows li {
		border-bottom: var(--bd);
	}
	.rows a {
		display: flex;
		align-items: center;
		gap: 18px;
		padding: 22px 8px;
		text-decoration: none;
		transition:
			padding 0.2s,
			background 0.2s,
			color 0.2s;
	}
	.rows a:hover {
		padding-inline: 22px;
		background: var(--ink);
		color: var(--paper);
	}
	.rows a b {
		flex: 1;
		font-size: clamp(22px, 3vw, 32px);
		font-weight: 800;
		letter-spacing: -0.03em;
	}
	.row-n,
	.row-hint {
		font: 700 10px/1 var(--font-mono);
		letter-spacing: 0.14em;
		text-transform: uppercase;
		opacity: 0.65;
	}
	.board-foot.dark {
		margin-top: 34px;
	}
	@media (max-width: 680px) {
		.open-row {
			flex-direction: column;
			align-items: flex-start;
		}
		.row-hint {
			display: none;
		}
		.board-foot {
			flex-direction: column;
			gap: 8px;
		}
	}
</style>
