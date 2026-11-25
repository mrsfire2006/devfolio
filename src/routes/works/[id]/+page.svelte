<script lang="ts">
	import { page } from '$app/state';

	import {
		ArrowDown,
		ArrowLeft,
		ArrowUpRight,
		ExternalLink,
 
		RefreshCw,
		Code2
	} from '@lucide/svelte';

	import { getProject } from '#lib/queries/projects.ts';
	import type { PublicFullProject } from '#lib/dtos/project/public.ts';
	import ImageLightBox from '../../_components/ImageLightBox.svelte';
 
	type ProjectImage = NonNullable<PublicFullProject['images'][number]>;

	const projectQuery = getProject<'PUBLIC'>(() => page.params.id!, 'PUBLIC');

	const project = $derived((projectQuery.data?.value ?? null) as PublicFullProject | null);

	// null images are filtered out, and the type is narrowed.
	const images = $derived(
		(project?.images ?? []).filter((image): image is ProjectImage => image !== null)
	);

	const coverImage = $derived(images[0] ?? null);
	const galleryImages = $derived(images.slice(1));

	// Lightbox: index of the image to open first, or null when closed.
	let lightboxIndex = $state<number | null>(null);

	const lightboxImages = $derived(
		images.map((image, i) => ({
			url: image.url,
			alt: project ? `${project.name} — ${String(i + 1).padStart(2, '0')}` : undefined
		}))
	);

	const skills = $derived(project?.skills ?? []);
	// The "THE STACK" circle sits in the middle: half the chips before it, half after.
	const stackMid = $derived(Math.ceil(skills.length / 2));

	const statusLabel = $derived(
		project ? String(project.status ?? 'NO STATUS').replace(/_/g, ' ') : ''
	);

	const statusClass = $derived(
		project?.status === 'COMPLETED'
			? 'completed'
			: project?.status === 'IN_PROGRESS'
				? 'in-progress'
				: 'default'
	);

	const year = new Date().getFullYear();

	// Scroll reveal. Inline styles, so it doesn't depend on any global CSS class.
	function reveal(node: HTMLElement) {
		if (
			typeof IntersectionObserver === 'undefined' ||
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		) {
			return;
		}

		node.style.opacity = '0';
		node.style.transform = 'translateY(24px)';
		node.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					node.style.opacity = '1';
					node.style.transform = 'none';
					observer.disconnect();
				}
			},
			{ threshold: 0.12 }
		);

		observer.observe(node);

		return {
			destroy() {
				observer.disconnect();
			}
		};
	}
</script>

<svelte:head>
	<title>{project ? `${project.name} — Mohamed Sarhan` : 'Project — Mohamed Sarhan'}</title>

	<meta
		name="description"
		content={project?.description ?? 'Explore this project by Mohamed Sarhan.'}
	/>

	{#if coverImage !== null}
		<meta property="og:image" content={coverImage.url} />
	{/if}
</svelte:head>

<main class="project-page">
	<!-- ═════════ LOADING / ERROR / NOT FOUND ═════════ -->

	{#if projectQuery.isPending}
		<section class="state-section">
			<div class="wrap">
				<div class="loading">
					<div class="skeleton skeleton-label"></div>
					<div class="skeleton skeleton-title"></div>
					<div class="skeleton skeleton-description"></div>
					<div class="skeleton skeleton-image"></div>
				</div>
			</div>
		</section>
	{:else if projectQuery.isError || projectQuery.data?.isSuccess === false}
		<section class="state-section">
			<div class="wrap">
				<div class="state">
					<span class="state-symbol">!</span>
					<p class="kicker"><span class="kicker-dot"></span>SOMETHING WENT WRONG</p>

					<h1 class="headline">COULDN'T LOAD<br />THIS PROJECT.</h1>

					<p class="state-description">
						{projectQuery.data?.errorMsg ?? 'Something went wrong. Please try again.'}
					</p>

					<button type="button" class="btn dark" onclick={() => projectQuery.refetch()}>
						<RefreshCw size={16} />
						TRY AGAIN
					</button>
				</div>
			</div>
		</section>
	{:else if !project}
		<section class="state-section">
			<div class="wrap">
				<div class="state">
					<span class="state-symbol">?</span>
					<p class="kicker"><span class="kicker-dot"></span>404 / PROJECT NOT FOUND</p>

					<h1 class="headline">NOTHING<br />HERE.</h1>

					<p class="state-description">
						This project may have been removed or is no longer available.
					</p>

					<a href="/#work" class="btn dark">
						<ArrowLeft size={16} />
						BACK TO WORK
					</a>
				</div>
			</div>
		</section>
	{:else}
		<!-- ═════════ HERO — YELLOW ═════════ -->

		<section class="project-hero">
			<div class="wrap">
				<div class="topline">
					<a href="/#work" class="back">
						<ArrowLeft size={14} />
						ALL PROJECTS
					</a>
					<span>PORTFOLIO / PROJECTS</span>
					<span>01 / 05</span>
				</div>

				<div class="hero-content">
					<div class="hero-copy" use:reveal>
						<div class="project-status {statusClass}">
							<i></i>
							{statusLabel}
						</div>

						<p class="kicker"><span class="kicker-dot"></span>PROJECT OVERVIEW</p>

						<h1 class="headline project-title">
							{project.name}<span class="period">.</span>
						</h1>

						<p class="description">{project.description}</p>

						<div class="hero-actions">
							{#if project.livePreview}
								<a
									class="btn dark"
									href={project.livePreview}
									target="_blank"
									rel="noopener noreferrer"
								>
									LIVE PREVIEW
									<ExternalLink size={16} />
								</a>
							{/if}

							{#if project.githubUrl}
								<a
									class="btn light"
									href={project.githubUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									<!-- <Github size={16} /> -->
									SOURCE CODE
									<ArrowUpRight size={15} />
								</a>
							{/if}
						</div>
					</div>

					<div class="hero-aside" aria-hidden="true">
						<div class="orbit">
							<div class="orbit-inner">
								<Code2 size={48} strokeWidth={1.4} />
								<span>PROJECT<br />NO. 01</span>
							</div>
						</div>

						<span class="floating-label label-one">DESIGNED</span>
						<span class="floating-label label-two">DEVELOPED</span>
						<span class="floating-star">✳</span>
					</div>
				</div>

				<div class="hero-foot">
					<span>SCROLL TO EXPLORE</span>
					<ArrowDown size={17} />
					<span>PROJECT / {project.name.toUpperCase()}</span>
				</div>
			</div>
		</section>

		<!-- ═════════ PREVIEW — BLUE ═════════ -->

		<section class="preview-section" id="preview">
			<div class="wrap">
				<div class="section-head" use:reveal>
					<div>
						<p class="kicker"><span class="kicker-dot"></span>01 / THE RESULT</p>
						<h2 class="headline">MADE TO <span>WORK.</span></h2>
					</div>

					<p class="side-note">A CLOSER LOOK<br />AT THE PRODUCT</p>
				</div>

				<div class="preview-frame" use:reveal>
					<div class="frame-top">
						<div class="window-dots"><i></i><i></i><i></i></div>

						<span>{project.name.toLowerCase().replaceAll(' ', '-')}.app</span>

						<span class="live-indicator"><i></i>PROJECT PREVIEW</span>
					</div>

					{#if coverImage !== null}
						<div class="main-image">
							<button
								type="button"
								class="zoom-btn"
								onclick={() => (lightboxIndex = 0)}
								aria-label={`Open ${project.name} preview`}
							>
								<img src={coverImage.url} alt={`${project.name} preview`} fetchpriority="high" />
							</button>
						</div>
					{:else}
						<div class="empty-preview">
							<Code2 size={64} strokeWidth={1} />
							<strong>{project.name}</strong>
							<span>PROJECT PREVIEW</span>
						</div>
					{/if}
				</div>

				<div class="preview-caption">
					<span>FIG 01 — MAIN INTERFACE</span>
					<span>{String(images.length).padStart(2, '0')} IMAGES</span>
				</div>

				{#if galleryImages.length > 0}
					<div class="gallery" use:reveal>
						{#each galleryImages as image, i ( i)}
							<figure class="gallery-item">
								<button
									type="button"
									class="zoom-btn"
									onclick={() => (lightboxIndex = i + 1)}
									aria-label={`Open screenshot ${i + 2}`}
								>
									<img src={image.url} alt={`${project.name} screenshot ${i + 2}`} loading="lazy" />
								</button>
								<figcaption>
									<span>FIG {String(i + 2).padStart(2, '0')}</span>
									<span>{project.name}</span>
								</figcaption>
							</figure>
						{/each}
					</div>
				{/if}
			</div>
		</section>

		<!-- ═════════ ABOUT — CORAL ═════════ -->

		<section class="about-section">
			<div class="wrap">
				<div class="section-head" use:reveal>
					<div>
						<p class="kicker"><span class="kicker-dot"></span>02 / BEHIND THE BUILD</p>
						<h2 class="headline">ABOUT<br /><span>THE PROJECT.</span></h2>
					</div>

					<p class="side-note">IDEA → DESIGN<br />→ DEVELOPMENT</p>
				</div>

				<div class="about-grid" use:reveal>
					<div class="about-main">
						<span class="small-label">THE IDEA</span>

						<h3>Building<br />something<br /><span>useful.</span></h3>

						<p>{project.description}</p>

						<div class="about-bottom">
							<span>PROJECT OVERVIEW</span>
							<ArrowUpRight size={22} />
						</div>
					</div>

					<div class="about-side">
						<div class="info-block">
							<span class="small-label">PROJECT STATUS</span>
							<div class="status {statusClass}">
								<i></i>
								{statusLabel}
							</div>
						</div>

						<div class="info-block">
							<span class="small-label">TECHNOLOGIES</span>
							<strong>{String(skills.length).padStart(2, '0')}</strong>
							<span class="info-caption">TOOLS & TECHNOLOGIES</span>
						</div>

						<div class="info-block last">
							<span class="small-label">PROJECT TYPE</span>
							<strong>WEB<br />PRODUCT</strong>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- ═════════ STACK — PURPLE ═════════ -->

		<section class="stack-section">
			<div class="wrap">
				<div class="section-head" use:reveal>
					<div>
						<p class="kicker"><span class="kicker-dot"></span>03 / THE TOOLBOX</p>
						<h2 class="headline">BUILT <span>WITH.</span></h2>
					</div>

					<p class="side-note">TOOLS THAT<br />POWER THE PRODUCT</p>
				</div>

				<div class="stack-board" use:reveal>
					<div class="stack-center">
						<span>POWERED BY</span>
						<strong>THE<br />STACK<span>.</span></strong>
						<i></i>
					</div>

					{#each skills as skill, i (i ?? skill.name)}
						<div
							class="stack-item"
							class:tilt-left={i % 2 === 0}
							class:tilt-right={i % 2 !== 0}
							data-tone={i % 3}
							style:order={i < stackMid ? -1 : 1}
						>
							<i></i>
							<strong>{skill.name}</strong>
							<ArrowUpRight size={13} />
						</div>
					{/each}

					{#if skills.length === 0}
						<p class="stack-empty">NO TECHNOLOGIES ADDED YET.</p>
					{/if}

					<div class="stack-board-foot">
						<span>ENGINEERING / DEVELOPMENT</span>
						<span>{skills.length} TECHNOLOGIES</span>
					</div>
				</div>

				<div class="stack-caption">
					<span>THE TECHNOLOGIES BEHIND THE PRODUCT</span>
					<span>03 / STACK</span>
				</div>
			</div>
		</section>

		<!-- ═════════ FINAL — DARK ═════════ -->

		<section class="next-section">
			<div class="wrap">
				<div class="next-top">
					<span>04 / WHAT'S NEXT</span>
					<span>KEEP EXPLORING</span>
				</div>

				<h2 class="headline">THAT'S<br /><span>THE BUILD.</span></h2>

				<div class="next-row">
					<p>
						Every project is another opportunity<br />
						to build something meaningful.
					</p>

					<a href="/#work" class="next-link">
						<span>EXPLORE MORE PROJECTS</span>
						<ArrowUpRight size={25} />
					</a>
				</div>

				<div class="next-foot">
					<a href="/#work">
						<ArrowLeft size={15} />
						BACK TO ALL WORK
					</a>

					<span>MOHAMED SARHAN / {year}</span>
				</div>
			</div>
		</section>
	{/if}

	{#if lightboxIndex !== null && lightboxImages.length > 0}
		<ImageLightBox
			images={lightboxImages}
			startIndex={lightboxIndex}
			label={`${project?.name ?? 'Project'} images`}
			onclose={() => (lightboxIndex = null)}
		/>
	{/if}
</main>

<style>
	/* ═══════════════════════════════════════
	   PALETTE — taken from the portfolio screenshot.
	   Scoped here on purpose: layout.css already uses
	   --accent / --violet for the Forge theme, and
	   overriding them globally would break the app.
	═══════════════════════════════════════ */

	.project-page {
		--c1: #dfba80; /* tan / hero */
		--c2: #efd9ad; /* light tan */
		--c3: #97bbe1; /* blue */
		--c4: #c2aee1; /* purple */
		--c5: #ee9079; /* coral */

		--ink: #131a3c; /* navy */
		--paper: #fcf8ec; /* cream */

		--accent: #d9705a;
		--gold-d: #dfba80;
		--violet: #8f72c4;
		--blue-d: #5b8fd0;
		--ok: #3fae7a;

		--bd: 2px solid var(--ink);
		--sh-lg: 8px 8px 0 var(--ink);

		overflow: hidden;
		background: var(--c1);
		color: var(--ink);
		font-family: var(--font-sans);
	}

	.project-page a {
		color: inherit;
	}

	.wrap {
		width: 100%;
		max-width: 1324px;
		margin-inline: auto;
		padding-inline: clamp(20px, 5vw, 72px);
	}

	/* Named .headline (not .display) so layout.css's `.display { font-size: … !important }` can't override it */
	.headline {
		margin: 0;
		font-weight: 900;
		line-height: 0.86;
		letter-spacing: -0.06em;
		text-transform: uppercase;
	}

	.kicker,
	.small-label,
	.side-note,
	.topline,
	.hero-foot,
	.preview-caption,
	.stack-caption,
	.next-top,
	.next-foot,
	.stack-board-foot {
		font-family: var(--font-mono);
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.13em;
		text-transform: uppercase;
	}

	.kicker {
		display: flex;
		align-items: center;
		gap: 9px;
		margin: 0 0 24px;
	}

	.kicker-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--accent);
	}

	.section-head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 20px;
		margin-bottom: 42px;
	}

	.section-head .headline {
		font-size: clamp(48px, 8vw, 100px);
	}

	.section-head .headline span {
		color: var(--gold-d);
	}

	.side-note {
		margin: 0 0 5px;
		line-height: 1.8;
		text-align: right;
	}

	/* ═══════ BUTTONS ═══════ */

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 14px 18px;
		border: var(--bd);
		border-radius: 10px;
		box-shadow: 4px 4px 0 var(--ink);
		font: 800 10px/1 var(--font-mono);
		letter-spacing: 0.1em;
		text-decoration: none;
		cursor: pointer;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
	}

	.btn:hover {
		transform: translate(3px, 3px);
		box-shadow: 1px 1px 0 var(--ink);
	}

	.btn:active {
		transform: translate(4px, 4px);
		box-shadow: none;
	}

	.btn.dark {
		background: var(--ink);
		color: var(--paper);
	}

	.btn.light {
		background: var(--paper);
		color: var(--ink);
	}

	/* ═══════ STATES ═══════ */

	.state-section {
		display: flex;
		min-height: 75vh;
		align-items: center;
		padding: 70px 0;
		background-color: var(--c1);
		background-image: radial-gradient(
			color-mix(in oklab, var(--ink) 14%, transparent) 1.5px,
			transparent 1.5px
		);
		background-size: 22px 22px;
	}

	.state {
		max-width: 650px;
		padding: 40px 0;
	}

	.state-symbol {
		display: grid;
		width: 55px;
		height: 55px;
		place-items: center;
		margin-bottom: 35px;
		border: var(--bd);
		border-radius: 14px;
		background: var(--paper);
		box-shadow: 4px 4px 0 var(--ink);
		font-size: 25px;
		font-weight: 900;
	}

	.state .headline {
		margin-top: 20px;
		font-size: clamp(55px, 9vw, 100px);
		line-height: 0.9;
	}

	.state-description {
		max-width: 400px;
		margin: 25px 0;
		font-size: 15px;
		line-height: 1.7;
	}

	.loading {
		display: grid;
		gap: 25px;
		padding: 60px 0;
	}

	.skeleton {
		border: var(--bd);
		border-radius: 10px;
		background: color-mix(in oklab, var(--ink) 9%, var(--c1));
		animation: skeleton-pulse 1.5s ease-in-out infinite alternate;
	}

	.skeleton-label {
		width: 140px;
		height: 13px;
	}

	.skeleton-title {
		width: min(600px, 90%);
		height: 100px;
	}

	.skeleton-description {
		width: min(400px, 85%);
		height: 45px;
	}

	.skeleton-image {
		width: 100%;
		max-width: 650px;
		aspect-ratio: 16 / 9;
	}

	@keyframes skeleton-pulse {
		from {
			opacity: 0.4;
		}
		to {
			opacity: 1;
		}
	}

	/* ═══════ HERO — YELLOW ═══════ */

	.project-hero {
		position: relative;
		overflow: hidden;
		/* leaves room for the floating navbar */
		padding-top: 64px;
		border-bottom: var(--bd);
		background-color: var(--c1);
		background-image: radial-gradient(
			color-mix(in oklab, var(--ink) 14%, transparent) 1.5px,
			transparent 1.5px
		);
		background-size: 22px 22px;
	}

	.topline {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 15px;
		padding: 22px 0;
		border-bottom: var(--bd);
		font-size: 8px;
	}

	.back,
	.next-foot a {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		text-decoration: none;
	}

	.hero-content {
		display: grid;
		grid-template-columns: 1.3fr 0.7fr;
		align-items: center;
		gap: 40px;
		min-height: 530px;
		padding-block: 75px;
	}

	.hero-copy {
		min-width: 0;
	}

	.project-status {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		margin-bottom: 30px;
		padding: 9px 13px;
		border: var(--bd);
		border-radius: 10px;
		background: var(--paper);
		box-shadow: 3px 3px 0 var(--ink);
		font: 700 9px/1 var(--font-mono);
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.project-status i,
	.status i {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--gold-d);
		border: 1px solid var(--ink);
	}

	.project-status.completed i,
	.status.completed i {
		background: var(--ok);
	}

	.project-status.in-progress i,
	.status.in-progress i {
		background: var(--violet);
	}

	.project-title {
		max-width: 850px;
		font-size: clamp(65px, 10vw, 145px);
		overflow-wrap: anywhere;
	}

	.period {
		color: var(--accent);
	}

	.description {
		max-width: 440px;
		margin: 28px 0;
		font-size: 15px;
		font-weight: 500;
		line-height: 1.7;
		white-space: pre-line;
	}

	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 14px;
	}

	.hero-aside {
		position: relative;
		display: grid;
		min-height: 340px;
		place-items: center;
	}

	.orbit {
		display: grid;
		width: min(260px, 70%);
		aspect-ratio: 1;
		place-items: center;
		border: 2px solid var(--ink);
		border-radius: 50%;
		transform: rotate(-12deg);
	}

	.orbit-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 15px;
		transform: rotate(12deg);
	}

	.orbit-inner span {
		font: 700 9px/1.6 var(--font-mono);
		letter-spacing: 0.12em;
		text-align: center;
	}

	.floating-label {
		position: absolute;
		padding: 10px 14px;
		border: var(--bd);
		border-radius: 8px;
		background: var(--paper);
		box-shadow: 4px 4px 0 var(--ink);
		font: 800 9px var(--font-mono);
	}

	.label-one {
		top: 18%;
		right: 0;
		transform: rotate(7deg);
	}

	.label-two {
		bottom: 20%;
		left: 0;
		transform: rotate(-7deg);
	}

	.floating-star {
		position: absolute;
		top: 10%;
		left: 20%;
		font-size: 32px;
		color: var(--accent);
	}

	.hero-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 15px;
		padding: 20px 0;
		border-top: var(--bd);
		font-size: 8px;
	}

	/* ═══════ PREVIEW — BLUE ═══════ */

	.preview-section {
		overflow: hidden;
		padding-block: 90px;
		border-bottom: var(--bd);
		background: var(--c3);
	}

	.preview-frame {
		padding: 10px;
		border: var(--bd);
		border-radius: 20px;
		background: var(--paper);
		box-shadow: var(--sh-lg);
	}

	.frame-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 12px 10px 18px;
		font: 700 9px var(--font-mono);
	}

	.window-dots {
		display: flex;
		gap: 5px;
	}

	.window-dots i {
		width: 8px;
		height: 8px;
		border: 1px solid var(--ink);
		border-radius: 50%;
		background: var(--accent);
	}

	.window-dots i:nth-child(2) {
		background: var(--gold-d);
	}

	.window-dots i:nth-child(3) {
		background: var(--violet);
	}

	.live-indicator {
		display: flex;
		align-items: center;
		gap: 7px;
		font-size: 8px;
	}

	.live-indicator i {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--accent);
	}

	.main-image {
		overflow: hidden;
		border: var(--bd);
		border-radius: 12px;
		background: var(--c2);
	}

	.main-image img {
		display: block;
		width: 100%;
		height: auto;
		max-height: 750px;
		object-fit: contain;
	}

	.empty-preview {
		display: flex;
		min-height: 420px;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 18px;
		border: var(--bd);
		border-radius: 12px;
		background: var(--c2);
	}

	.empty-preview strong {
		font-size: clamp(35px, 6vw, 70px);
		font-weight: 900;
		letter-spacing: -0.06em;
		text-align: center;
		overflow-wrap: anywhere;
	}

	.empty-preview span {
		font: 700 9px var(--font-mono);
		letter-spacing: 0.15em;
	}

	.preview-caption,
	.stack-caption {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		padding-top: 18px;
		font-size: 8px;
	}

	.gallery {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 24px;
		margin-top: 55px;
	}

	.gallery-item {
		min-width: 0;
		margin: 0;
		padding: 8px;
		border: var(--bd);
		border-radius: 15px;
		background: var(--paper);
		box-shadow: 5px 5px 0 var(--ink);
	}

	.gallery-item img {
		display: block;
		width: 100%;
		height: auto;
		border: var(--bd);
		border-radius: 8px;
	}

	.gallery-item figcaption {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		padding: 12px 4px 5px;
		font: 700 8px var(--font-mono);
	}

	.zoom-btn {
		display: block;
		width: 100%;
		padding: 0;
		border: 0;
		background: none;
		color: inherit;
		cursor: zoom-in;
	}

	.zoom-btn:focus-visible {
		outline: 3px solid var(--accent);
		outline-offset: 3px;
	}

	.gallery-item .zoom-btn img {
		transition: transform 0.25s ease;
	}

	.gallery-item .zoom-btn:hover img {
		transform: scale(1.015);
	}

	/* ═══════ ABOUT — CORAL ═══════ */

	.about-section {
		overflow: hidden;
		padding-block: 100px;
		border-bottom: var(--bd);
		background: var(--c5);
	}

	.about-grid {
		display: grid;
		grid-template-columns: 1.5fr 0.7fr;
		gap: 25px;
	}

	.about-main,
	.about-side {
		min-width: 0;
		border: var(--bd);
		border-radius: 20px;
		box-shadow: var(--sh-lg);
	}

	.about-main {
		display: flex;
		min-height: 390px;
		flex-direction: column;
		padding: clamp(25px, 4vw, 45px);
		background: var(--paper);
	}

	.about-main h3 {
		margin: 40px 0 22px;
		font-size: clamp(48px, 7vw, 90px);
		font-weight: 900;
		line-height: 0.86;
		letter-spacing: -0.06em;
		text-transform: uppercase;
	}

	.about-main h3 span {
		color: var(--accent);
	}

	.about-main > p {
		max-width: 480px;
		font-size: 14px;
		font-weight: 500;
		line-height: 1.7;
		white-space: pre-line;
	}

	.about-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: auto;
		padding-top: 25px;
		border-top: var(--bd);
		font: 700 9px var(--font-mono);
		letter-spacing: 0.1em;
	}

	.about-side {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		background: var(--c1);
	}

	.info-block {
		display: flex;
		flex-direction: column;
		gap: 15px;
		padding: 25px;
		border-bottom: var(--bd);
	}

	.info-block strong {
		font-size: clamp(34px, 4vw, 55px);
		font-weight: 900;
		line-height: 0.9;
		letter-spacing: -0.06em;
	}

	.status {
		display: flex;
		align-items: center;
		gap: 9px;
		font: 800 11px var(--font-mono);
		text-transform: uppercase;
	}

	.info-caption {
		font: 700 8px var(--font-mono);
		letter-spacing: 0.1em;
	}

	.info-block.last {
		border-bottom: 0;
	}

	/* ═══════ STACK — PURPLE ═══════ */

	.stack-section {
		overflow: hidden;
		padding-block: 100px;
		border-bottom: var(--bd);
		background: var(--c4);
	}

	.stack-board {
		position: relative;
		display: flex;
		min-height: 420px;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 30px;
		padding: 65px 35px;
		border: var(--bd);
		border-radius: 20px;
		background-color: var(--c1);
		background-image:
			linear-gradient(color-mix(in oklab, var(--ink) 7%, transparent) 1px, transparent 1px),
			linear-gradient(90deg, color-mix(in oklab, var(--ink) 7%, transparent) 1px, transparent 1px);
		background-size: 24px 24px;
		box-shadow: var(--sh-lg);
	}

	.stack-center {
		display: flex;
		width: 180px;
		flex: 0 0 180px;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		aspect-ratio: 1;
		border: 2px solid var(--ink);
		border-radius: 50%;
		background: var(--paper);
		text-align: center;
		order: 0;
	}

	.stack-center > span {
		font: 700 8px var(--font-mono);
		letter-spacing: 0.13em;
	}

	.stack-center strong {
		margin: 10px 0;
		font-size: 36px;
		font-weight: 900;
		line-height: 0.86;
		letter-spacing: -0.06em;
	}

	.stack-center strong span {
		color: var(--accent);
	}

	.stack-center > i {
		width: 25px;
		height: 3px;
		background: var(--accent);
	}

	.stack-item {
		display: inline-flex;
		max-width: 100%;
		align-items: center;
		gap: 8px;
		padding: 12px 15px;
		border: var(--bd);
		border-radius: 9px;
		background: var(--paper);
		box-shadow: 3px 3px 0 var(--ink);
		font-size: 11px;
	}

	.stack-item.tilt-left {
		transform: rotate(-3deg);
	}

	.stack-item.tilt-right {
		transform: rotate(3deg);
	}

	.stack-item > i {
		width: 8px;
		height: 8px;
		flex: 0 0 8px;
		border: 1px solid var(--ink);
		border-radius: 50%;
		background: var(--accent);
	}

	.stack-item[data-tone='1'] > i {
		background: var(--violet);
	}

	.stack-item[data-tone='2'] > i {
		background: var(--blue-d);
	}

	.stack-item strong {
		overflow-wrap: anywhere;
	}

	.stack-empty {
		width: 100%;
		margin: 0;
		order: 1;
		font: 700 10px var(--font-mono);
		text-align: center;
	}

	.stack-board-foot {
		position: absolute;
		right: 20px;
		bottom: 15px;
		left: 20px;
		display: flex;
		justify-content: space-between;
		gap: 12px;
		font-size: 7px;
	}

	/* ═══════ FINAL — DARK ═══════ */

	.next-section {
		overflow: hidden;
		padding-block: 80px 35px;
		background: var(--ink);
		color: var(--paper);
	}

	.next-top,
	.next-foot {
		display: flex;
		justify-content: space-between;
		gap: 15px;
		font-size: 8px;
		opacity: 0.65;
	}

	.next-section .headline {
		margin: 75px 0;
		font-size: clamp(75px, 15vw, 190px);
	}

	.next-section .headline span {
		color: var(--gold-d);
	}

	.next-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 25px;
		padding: 25px 0;
		border-top: 1px solid color-mix(in oklab, var(--paper) 35%, transparent);
		border-bottom: 1px solid color-mix(in oklab, var(--paper) 35%, transparent);
	}

	.next-row p {
		margin: 0;
		font-size: 14px;
		line-height: 1.6;
	}

	.next-link {
		display: flex;
		align-items: center;
		gap: 18px;
		font: 800 10px var(--font-mono);
		letter-spacing: 0.1em;
		text-decoration: none;
	}

	.next-foot {
		margin-top: 35px;
	}

	/* ═══════ RESPONSIVE ═══════ */

	@media (max-width: 800px) {
		.hero-content {
			grid-template-columns: 1fr;
			padding-block: 65px;
		}

		.hero-aside {
			min-height: 260px;
		}

		.about-grid {
			grid-template-columns: 1fr;
		}

		.about-side {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.info-block {
			border-right: var(--bd);
			border-bottom: 0;
		}

		.info-block.last {
			grid-column: 1 / -1;
			border-top: var(--bd);
			border-right: 0;
		}

		.stack-board {
			gap: 25px;
		}
	}

	@media (max-width: 600px) {
		.topline {
			font-size: 7px;
		}

		.topline > span:last-child {
			display: none;
		}

		.project-title {
			font-size: clamp(55px, 15vw, 90px);
		}

		.section-head {
			align-items: flex-start;
			flex-direction: column;
			gap: 15px;
		}

		.section-head .side-note {
			text-align: left;
		}

		.section-head .headline {
			font-size: clamp(48px, 12vw, 72px);
		}

		.preview-section,
		.about-section,
		.stack-section {
			padding-block: 65px;
		}

		.gallery {
			grid-template-columns: 1fr;
			gap: 20px;
		}

		.frame-top {
			font-size: 7px;
		}

		.live-indicator {
			font-size: 6px;
		}

		.about-main {
			min-height: 350px;
		}

		.stack-board {
			gap: 20px 12px;
			padding: 35px 15px 55px;
		}

		.stack-center {
			width: 155px;
			flex-basis: 155px;
		}

		.stack-item {
			padding: 10px;
			font-size: 10px;
		}

		.next-section .headline {
			margin-block: 55px;
			font-size: clamp(65px, 16vw, 100px);
		}

		.next-row {
			align-items: flex-start;
			flex-direction: column;
		}

		.next-foot {
			flex-direction: column;
		}

		.hero-foot {
			font-size: 7px;
		}
	}

	@media (max-width: 380px) {
		.about-side {
			grid-template-columns: 1fr;
		}

		.info-block {
			border-right: 0;
			border-bottom: var(--bd);
		}

		.info-block.last {
			grid-column: auto;
		}

		.hero-actions {
			align-items: stretch;
			flex-direction: column;
		}

		.hero-foot span:last-child {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.project-page *,
		.project-page *::before,
		.project-page *::after {
			scroll-behavior: auto !important;
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			transition-duration: 0.01ms !important;
		}
	}
</style>
