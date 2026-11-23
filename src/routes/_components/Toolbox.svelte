<script lang="ts">
	import { getSkills } from '#lib/queries/skills.ts';
	import { getSkillLayout } from '#lib/skill-layout.ts';

	const year = new Date().getFullYear();

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
	const skillsQuery = getSkills();
	const skills = $derived(skillsQuery.data?.value ?? []);
	const stack = $derived(
		skills.map((skill, index) => ({
			...skill,
			...getSkillLayout(skill.id, skill.name, index)
		}))
	);
	// const stack = [
	// 	{ label: 'TypeScript', short: 'TS', x: 14, y: 20, r: -4, tone: 'var(--paper)' },
	// 	{ label: 'React', short: 'Re', x: 36, y: 10, r: 3, tone: 'var(--c3)' },
	// 	{ label: 'Astro', short: 'As', x: 84, y: 20, r: -3, tone: 'var(--c2)' },
	// 	{ label: 'SolidJS', short: 'So', x: 72, y: 36, r: 4, tone: 'var(--c4)' },
	// 	{ label: 'C#', short: 'C#', x: 11, y: 52, r: -2, tone: 'var(--c3)' },
	// 	{ label: 'ASP.NET', short: '.N', x: 84, y: 56, r: 2, tone: 'var(--paper)' },
	// 	{ label: 'Node.js', short: 'No', x: 34, y: 78, r: -3, tone: 'var(--c3)' },
	// 	{ label: 'PostgreSQL', short: 'Pg', x: 66, y: 80, r: 3, tone: 'var(--c3)' },
	// 	{ label: 'SQL Server', short: 'Sq', x: 14, y: 82, r: -5, tone: 'var(--c2)' },
	// 	{
	// 		label: 'And more',
	// 		short: '+',
	// 		x: 50,
	// 		y: 93,
	// 		r: 0,
	// 		tone: 'var(--paper)'
	// 	}
	// ];
</script>

<section class="sec stack" id="stack">
	<div class="wrap">
		<div class="head reveal" use:reveal>
			<div>
				<p class="eyebrow">03 / Toolbox</p>
				<h2 class="display">Things <span class="paper">I use.</span></h2>
			</div>
			<p class="aside mono">FRONTEND<br />BACKEND<br />DATABASE</p>
		</div>

		<div class="board reveal" use:reveal>
			<div class="ring">
				<small>Foundation</small>
				<h3>MY<br />STACK<i>.</i></h3>
				<span class="bar"></span>
			</div>

			{#each stack.slice(0, 8) as s (s.id)}
				<span
					class="chip"
					style:--x="{s.x}%"
					style:--y="{s.y}%"
					style:--r="{s.r}deg"
					style:--tone={s.tone}
					style:--d="{s.delay}s"
				>
					<em>{s.short}</em>{s.name}
				</span>
			{/each}
			{#if stack.length > 8}
				<span
					class="chip"
					style:--x="50%"
					style:--y="93%"
					style:--r="0deg"
					style:--tone="var(--paper)"
					style:--d="0s"
				>
					<em>+</em>And more
				</span>
			{/if}
		</div>

		<div class="board-foot">
			<span>Frontend · Backend · Database</span>
			<span>{stack.length} tools / 01 stack</span>
			<span>{year}</span>
		</div>
	</div>
</section>

<style>
	.stack {
		background: var(--c4);
	}
	.stack .head {
		padding-bottom: 22px;
		border-bottom: var(--bd);
	}
	.board {
		position: relative;
		height: clamp(440px, 56vw, 580px);
		overflow: hidden;
		border: var(--bd);
		border-radius: 28px;
		background-color: var(--c1);
		background-image:
			linear-gradient(color-mix(in oklab, var(--ink) 9%, transparent) 1px, transparent 1px),
			linear-gradient(90deg, color-mix(in oklab, var(--ink) 9%, transparent) 1px, transparent 1px);
		background-size: 34px 34px;
		box-shadow: var(--sh-lg);
	}
	.ring {
		position: absolute;
		top: 50%;
		left: 50%;
		display: grid;
		place-content: center;
		justify-items: center;
		gap: 6px;
		width: clamp(190px, 24vw, 260px);
		aspect-ratio: 1;
		border: var(--bd);
		border-radius: 50%;
		background: color-mix(in oklab, var(--c1) 60%, white);
		transform: translate(-50%, -50%);
		text-align: center;
	}
	.ring small {
		font: 700 8px/1 var(--font-mono);
		letter-spacing: 0.2em;
		text-transform: uppercase;
	}
	.ring h3 {
		margin: 0;
		font-size: clamp(38px, 5.4vw, 66px);
		font-weight: 900;
		line-height: 0.82;
		letter-spacing: -0.07em;
	}
	.ring h3 i {
		color: var(--accent);
		font-style: normal;
	}
	.ring .bar {
		width: 34px;
		height: 3px;
		background: var(--accent);
	}
	.chip {
		position: absolute;
		top: var(--y);
		left: var(--x);
		z-index: 2;
		display: inline-flex;
		align-items: center;
		gap: 9px;
		padding: 8px 14px 8px 8px;
		border: var(--bd);
		border-radius: 10px;
		background: var(--tone);
		box-shadow: 4px 4px 0 var(--ink);
		font-size: 14px;
		font-weight: 800;
		white-space: nowrap;
		transform: translate(-50%, -50%) rotate(var(--r));
		animation: bob 4.5s ease-in-out infinite;
		animation-delay: var(--d);
		cursor: default;
		transition: scale 0.15s;
	}
	.chip:hover {
		z-index: 4;
		scale: 1.1;
	}
	.chip em {
		display: grid;
		place-items: center;
		width: 24px;
		height: 24px;
		border: 2px solid var(--ink);
		border-radius: 50%;
		background: var(--paper);
		font: 800 9px/1 var(--font-mono);
		font-style: normal;
	}
	.aside.mono {
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.18em;
	}

	@media (max-width: 680px) {
		.board {
			display: flex;
			flex-wrap: wrap;
			align-content: center;
			justify-content: center;
			gap: 14px;
			height: auto;
			padding: 28px 16px;
		}
		.ring {
			position: static;
			width: 100%;
			max-width: 220px;
			margin-bottom: 8px;
			transform: none;
		}
		.chip {
			position: static;
			transform: rotate(var(--r));
		}
	}
</style>
