<script lang="ts">
	import { ArrowUpRight, Plus, X } from '@lucide/svelte';
	import type { About } from '#lib/types/profile.ts';

	let { about }: { about: About } = $props();

	let tab = $state(about.tabs[0]?.id ?? '');

	const activeTab = $derived(about.tabs.find((t) => t.id === tab) ?? about.tabs[0]);

	const tabIndex = $derived(about.tabs.findIndex((t) => t.id === tab) + 1);

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

	const fullName = 'Mohamed Sarhan';
</script>

<section class="sec about" id="about">
	<div class="wrap">
		<div class="head reveal" use:reveal>
			<div>
				<p class="eyebrow">01 / About me</p>
				<h2 class="display">More than<br /><span class="yellow">code.</span></h2>
			</div>
			<p class="aside">FULL-STACK DEVELOPER<br />BUILDING FROM IDEA → PRODUCT</p>
		</div>

		<div class="about-grid reveal" use:reveal>
			<div class="tabs">
				{#each about.tabs as t, i (t.id)}
					<button
						type="button"
						class="tab"
						class:active={tab === t.id}
						aria-expanded={tab === t.id}
						onclick={() => (tab = t.id)}
					>
						<span class="tab-n">{String(i + 1).padStart(2, '0')}</span>
						<span class="tab-t">{t.title}</span>
						{#if tab === t.id}<X size={20} />{:else}<Plus size={20} />{/if}
					</button>
				{/each}

				<div class="status">
					<small>Current status</small>
					<p><i></i> Building something useful</p>
				</div>
			</div>

			{#if activeTab}
				{#key tab}
					<article class="card about-card">
						<div class="card-top">
							<span class="pill">{activeTab.pill}</span>
							<span class="round"><ArrowUpRight size={18} /></span>
						</div>

						<span class="rule"></span>

						<h3 class="card-title">
							{#each activeTab.lines as line (line)}
								<span>{line}</span>
							{/each}
						</h3>

						<p class="card-text">{activeTab.text}</p>

						<div class="card-foot">
							<span
								>{String(tabIndex).padStart(2, '0')} / {String(about.tabs.length).padStart(
									2,
									'0'
								)}</span
							>
							<b>{fullName}</b>
						</div>
					</article>
				{/key}
			{/if}
		</div>
	</div>
</section>

<style>
	/* ═════════ About ═════════ */
	.about {
		background: var(--c2);
	}
	.about-grid {
		display: grid;
		grid-template-columns: 300px 1fr;
		gap: clamp(20px, 3vw, 40px);
		align-items: start;
	}
	.tabs {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.tab {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 16px 18px;
		border: var(--bd);
		border-radius: 14px;
		background: var(--paper);
		box-shadow: 4px 4px 0 var(--ink);
		text-align: left;
		cursor: pointer;
		transition:
			transform 0.15s,
			box-shadow 0.15s,
			background 0.15s;
	}
	.tab:hover {
		transform: translate(2px, 2px);
		box-shadow: 2px 2px 0 var(--ink);
	}
	.tab.active {
		background: var(--ink);
		color: var(--paper);
		box-shadow: 4px 4px 0 var(--c1);
	}
	.tab-n {
		font: 700 10px/1 var(--font-mono);
		opacity: 0.6;
	}
	.tab-t {
		flex: 1;
		font-size: 19px;
		font-weight: 800;
		letter-spacing: -0.02em;
	}
	.tab.active .tab-t {
		color: var(--c1);
	}
	.status {
		margin-top: 40px;
		padding: 18px 20px;
		border: var(--bd);
		border-radius: 14px;
		background: var(--c1);
		box-shadow: 4px 4px 0 var(--ink);
	}
	.status small {
		font: 700 9px/1 var(--font-mono);
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}
	.status p {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 12px 0 0;
		font: 800 11px/1 var(--font-mono);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.status i {
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: var(--accent);
		animation: ping 1.8s ease-out infinite;
	}
	.about-card {
		display: flex;
		flex-direction: column;
		min-height: 380px;
		padding: clamp(22px, 3vw, 36px);
		animation: pop 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.2);
	}
	.status {
		margin-top: 40px;
		padding: 18px 20px;
		border: var(--bd);
		border-radius: 14px;
		background: var(--c1);
		box-shadow: 4px 4px 0 var(--ink);
	}
	.status small {
		font: 700 9px/1 var(--font-mono);
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}
	.status p {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 12px 0 0;
		font: 800 11px/1 var(--font-mono);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.status i {
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: var(--accent);
		animation: ping 1.8s ease-out infinite;
	}
	.card {
		border: var(--bd);
		border-radius: 24px;
		background: var(--paper);
		box-shadow: var(--sh-lg);
	}

	.card-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.rule {
		width: 64px;
		height: 3px;
		margin: 40px 0 16px;
		background: var(--accent);
	}

	.card-title {
		margin: 0;
		font-size: clamp(38px, 6vw, 76px);
		font-weight: 900;
		line-height: 0.88;
		letter-spacing: -0.05em;
	}
	.card-title span {
		display: block;
	}
	.card-text {
		max-width: 520px;
		margin: 20px 0 0;
		font-size: 15px;
		font-weight: 500;
		line-height: 1.6;
	}
	.card-foot {
		display: flex;
		justify-content: space-between;
		margin-top: auto;
		padding-top: 28px;
		font: 700 10px/1 var(--font-mono);
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	/* ═════════ About Responsive ═════════ */

@media (max-width: 900px) {
	.about-grid {
		grid-template-columns: 240px minmax(0, 1fr);
		gap: 24px;
	}

	.tab {
		padding: 14px;
		gap: 10px;
	}

	.tab-t {
		font-size: 16px;
	}

	.about-card {
		min-height: 340px;
	}

	.card-title {
		font-size: clamp(34px, 5vw, 58px);
	}
}

@media (max-width: 640px) {
	.about-grid {
		grid-template-columns: 1fr;
		gap: 24px;
	}

	.tabs {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
	}

	.tab {
		min-width: 0;
		padding: 14px 12px;
		gap: 8px;
	}

	.tab-t {
		font-size: 15px;
	}

	.tab-n {
		font-size: 9px;
	}

	.status {
		grid-column: 1 / -1;
		margin-top: 4px;
		padding: 14px 16px;
	}

	.status p {
		font-size: 10px;
	}

	.about-card {
		min-height: 320px;
		padding: 24px 20px;
	}

	.rule {
		margin: 32px 0 18px;
	}

	.card-title {
		font-size: clamp(38px, 10vw, 58px);
	}

	.card-text {
		font-size: 14px;
	}

	.card-foot {
		gap: 12px;
		font-size: 9px;
	}
}

@media (max-width: 380px) {
	.tabs {
		grid-template-columns: 1fr;
	}

	.tab {
		padding: 14px 16px;
	}

	.status {
		grid-column: auto;
	}

	.about-card {
		padding: 22px 16px;
	}

	.card-title {
		font-size: 36px;
	}

	.card-foot {
		letter-spacing: 0.06em;
	}
}
</style>
