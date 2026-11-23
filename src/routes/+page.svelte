<script lang="ts">
	import Hero from './_components/Hero.svelte';
	import Navbar from './_components/Navbar.svelte';
	import About from './_components/About.svelte';
	import Footer from './_components/Footer.svelte';
	import Work from './_components/Work.svelte';
	import Toolbox from './_components/Toolbox.svelte';
	import Contact from './_components/Contact.svelte';

	let { data } = $props();

	// const contacts = [
	// 	{ n: '01', label: 'Email', hint: 'Get in touch', href: 'mailto:mohamed.sarhan.dev@gmail.com' },
	// 	{ n: '02', label: 'GitHub', hint: 'See the code', href: 'https://github.com/mrsfire2006' },
	// 	{ n: '03', label: 'LinkedIn', hint: 'Connect', href: 'https://linkedin.com' },
	// 	{ n: '04', label: 'Resume', hint: 'View my CV', href: '/cv.pdf' }
	// ];
</script>

<svelte:head>
	<title>Devfolio · Lab</title>
</svelte:head>

<div class="lab">
	<Navbar />
	<!-- ═════════════ HERO ═════════════ -->
	<Hero hero={data.profile.hero} />

	<!-- ═════════════ ABOUT ═════════════ -->

	<About about={data.profile.about} />
	<!-- ═════════════ WORK ═════════════ -->

	<Work />
	<!-- ═════════════ STACK ═════════════ -->
	<!-- <section class="sec stack" id="stack">
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

				{#each stack as s, i (s.label)}
					<span
						class="chip"
						style:--x="{s.x}%"
						style:--y="{s.y}%"
						style:--r="{s.r}deg"
						style:--tone={s.tone}
						style:--d="{i * 0.35}s"
					>
						<em>{s.short}</em>{s.label}
					</span>
				{/each}
			</div>

			<div class="board-foot">
				<span>Frontend · Backend · Database</span>
				<span>{stack.length} tools / 01 stack</span>
				<span>{year}</span>
			</div>
		</div>
	</section> -->
	<Toolbox />
	<!-- ═════════════ CONTACT ═════════════ -->
	<!-- <section class="sec contact" id="contact">
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
				{#each contacts as c (c.label)}
					<li>
						<a
							href={c.href}
							target={c.href.startsWith('http') || c.href.endsWith('.pdf') ? '_blank' : undefined}
							rel={c.href.startsWith('http') || c.href.endsWith('.pdf')
								? 'noopener noreferrer'
								: undefined}
						>
							<span class="row-n">{c.n}</span>
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
	</section> -->
	<Contact contact={data.profile.contact} />

	<!-- ═════════════ FOOTER ═════════════ -->

	<Footer />
</div>

<style>
	/* ═════════ Tokens ═════════ */
	.lab {
		--ink: oklch(0.22 0.045 265);
		--paper: oklch(0.985 0.012 90);

		/* ألوان الأقسام: مشتقة من الـ theme ومفتّحة شوية */
		--c1: color-mix(in oklab, var(--gold) 80%, white);
		--c2: color-mix(in oklab, var(--primary) 82%, white);
		--c3: color-mix(in oklab, var(--blue) 78%, white);
		--c4: color-mix(in oklab, var(--violet) 72%, white);
		--c5: color-mix(in oklab, var(--primary) 55%, var(--c1));

		--accent: color-mix(in oklab, var(--primary) 88%, var(--ink) 12%);
		--blue-d: color-mix(in oklab, var(--blue) 65%, var(--ink));
		--gold-d: color-mix(in oklab, var(--gold) 65%, var(--ink));

		--bd: 3px solid var(--ink);
		--sh: 5px 5px 0 var(--ink);
		--sh-lg: 9px 9px 0 var(--ink);
		--r: 18px;

		font-family: var(--font-sans);
		color: var(--ink);
		background: var(--ink);
		overflow-x: clip;
	}

	/* ═════════ Shared ═════════ */

	/* ═════════ Contact ═════════ */
	/* .contact {
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
	} */

	/* ═════════ Responsive ═════════ */

	/* @media (max-width: 680px) {
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
	} */
</style>
