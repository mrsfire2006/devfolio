<script lang="ts">
	import { ArrowUp } from '@lucide/svelte';

	const year = new Date().getFullYear();
	const words = ['Build', 'Ship', 'Learn', 'Repeat'];
	const name = 'Mohamed';
</script>

<footer class="foot">
	<span class="ghost" aria-hidden="true">M</span>

	<div class="wrap">
		<div class="foot-top">
			<span>Portfolio / {year}</span>
			<span>End of page</span>
			<span>05 / 05</span>
		</div>

		<div class="foot-name">
			<h2>{name.toUpperCase()}<i></i></h2>
			<button
				type="button"
				class="top"
				onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
				aria-label="Back to top"
			>
				<ArrowUp size={18} />
				<small>Top</small>
			</button>
		</div>

		<p class="foot-sub">Full-stack developer / design · code · build</p>

		<div class="ticker" aria-hidden="true">
			<div class="track">
				{#each { length: 2 }, k (k)}
					<div class="set">
						{#each words as w (w)}
							<span>{w}</span><i>/</i>
						{/each}
					</div>
				{/each}
			</div>
		</div>

		<div class="foot-bottom">
			<span>Made with code & curiosity</span>
			<span>© {year} {name}</span>
		</div>
	</div>
</footer>

<style>
	.foot {
		position: relative;
		padding: clamp(40px, 6vw, 72px) clamp(20px, 5vw, 72px) 28px;
		overflow: hidden;
		background: var(--ink);
		color: var(--paper);
	}
	.ghost {
		position: absolute;
		top: -6%;
		right: -2%;
		font-size: clamp(260px, 40vw, 560px);
		font-weight: 900;
		line-height: 1;
		color: color-mix(in oklab, var(--paper) 6%, transparent);
		pointer-events: none;
	}
	.foot-top,
	.foot-bottom {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		font: 600 9px/1 var(--font-mono);
		letter-spacing: 0.18em;
		text-transform: uppercase;
		opacity: 0.7;
	}
	.foot-top {
		padding-bottom: 20px;
		border-bottom: 1px solid color-mix(in oklab, var(--paper) 22%, transparent);
	}
	.foot-name {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		margin-top: clamp(28px, 5vw, 56px);
	}
	.foot-name h2 {
		display: flex;
		align-items: flex-end;
		gap: 0.08em;
		margin: 0;
		color: var(--c1);
		font-size: clamp(60px, 16vw, 220px);
		font-weight: 900;
		line-height: 0.82;
		letter-spacing: -0.07em;
	}
	.foot-name h2 i {
		width: 0.2em;
		height: 0.2em;
		margin-bottom: 0.04em;
		border-radius: 50%;
		background: var(--c2);
	}
	.top {
		display: grid;
		place-items: center;
		gap: 2px;
		width: 74px;
		height: 74px;
		flex-shrink: 0;
		border: 2px solid var(--paper);
		border-radius: 50%;
		color: var(--paper);
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s,
			transform 0.15s;
	}
	.top small {
		font: 700 8px/1 var(--font-mono);
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}
	.top:hover {
		background: var(--c1);
		color: var(--ink);
		transform: translateY(-4px);
	}
	.foot-sub {
		margin: 16px 0 36px;
		font: 600 9px/1 var(--font-mono);
		letter-spacing: 0.18em;
		text-transform: uppercase;
		opacity: 0.7;
	}
	.ticker {
		overflow: hidden;
		padding: 22px 0;
		border-block: 1px solid color-mix(in oklab, var(--paper) 22%, transparent);
	}
	.track {
		display: flex;
		width: max-content;
		animation: marquee 22s linear infinite;
	}
	.set {
		display: flex;
		align-items: center;
		gap: 22px;
		padding-right: 22px;
	}
	.set span {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		font-size: clamp(22px, 3vw, 34px);
		font-weight: 800;
		letter-spacing: -0.02em;
		text-transform: uppercase;
	}
	.set span::before {
		content: '';
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--c2);
	}
	.set i {
		color: var(--c2);
		font-size: 28px;
		font-style: normal;
	}
	.foot-bottom {
		margin-top: 24px;
	}
	@media (max-width: 680px) {
		.foot-name {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
