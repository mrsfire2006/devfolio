<script lang="ts">
	import { getProjects } from '#lib/queries/projects.ts';
	import { ArrowRight, ArrowUpRight, X } from '@lucide/svelte';
	import SkillIcon from '../studio/dashboard/skills/_components/SkillIcon.svelte';
	import { resolve } from '$app/paths';

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

		return {
			destroy: () => io.disconnect()
		};
	}
	let selectedImage = $state<string | null>(null);

	function closeImage() {
		selectedImage = null;
	}
	const projectsQuery = getProjects('PUBLIC');

	const projects = $derived(projectsQuery.data?.value ?? []);
	const hasLoaded = $derived(projectsQuery.data?.value != null);

	let pi = $state(0);

	const selectedIndex = $derived(Math.min(pi, Math.max(projects.length - 1, 0)));

	const project = $derived(projects[selectedIndex]);

	const tones = [
		'linear-gradient(135deg, #203F48, #387D80)',
		'linear-gradient(135deg, #382C55, #755B9B)',
		'linear-gradient(135deg, #713E35, #BF8059)',
		'linear-gradient(135deg, #253A54, #4B7599)',
		'linear-gradient(135deg, #4C3A4C, #A66C85)',
		'linear-gradient(135deg, #344A3A, #77966C)'
	];

	function getTone(id: string) {
		let hash = 0;

		for (const char of id) {
			hash = (hash * 31 + char.charCodeAt(0)) | 0;
		}

		return tones[Math.abs(hash) % tones.length];
	}

	function formatMetadata(value: string | null) {
		if (!value?.trim()) return 'Independent project';

		const normalized = value
			.trim()
			.toUpperCase()
			.replace(/[\s-]+/g, '_');

		const labels: Record<string, string> = {
			FULL_STACK: 'Full-stack',
			FULLSTACK: 'Full-stack',
			REAL_TIME: 'Real-time',
			REALTIME: 'Real-time',
			DESKTOP_APP: 'Desktop app',
			DEVELOPER_TOOL: 'Developer tool',
			OPEN_SOURCE: 'Open source',
			E_COMMERCE: 'E-commerce',
			WEB_APP: 'Web application',
			MOBILE_APP: 'Mobile application',
			SAAS: 'SaaS',
			API: 'API',
			UI_UX: 'UI / UX'
		};

		return (
			labels[normalized] ??
			value
				.trim()
				.replace(/_/g, ' ')
				.replace(/\b\w/g, (char) => char.toUpperCase())
		);
	}

	function getStatusLabel(status: 'IN_PROGRESS' | 'COMPLETED' | null) {
		if (status === 'IN_PROGRESS') return 'In development';
		if (status === 'COMPLETED') return 'Completed';
		return 'Status unavailable';
	}

	function getInitials(name: string | null) {
		const normalized = name?.trim();

		return normalized ? normalized.slice(0, 2).toUpperCase() : '✳';
	}
</script>

<section class="sec work" id="work">
	<div class="wrap">
		<div class="head reveal" use:reveal>
			<div>
				<p class="eyebrow">02 / Selected work</p>
				<h2 class="display">My <span class="yellow">work.</span></h2>
			</div>

			<p class="aside">
				A SELECTION OF PRODUCTS AND SYSTEMS I'VE BUILT, FROM INTERFACE TO BACKEND.
			</p>
		</div>

		<div class="panel reveal" use:reveal>
			{#if !hasLoaded}
				<!-- Loading state -->
				<div class="plist">
					<div class="plist-heading">
						<span>PROJECT INDEX</span>
						<span>LOADING</span>
					</div>

					{#each [1, 2, 3] as item (item)}
						<div class="prow loading-row">
							<span class="skeleton sk-number"></span>

							<div class="prow-main">
								<span class="skeleton sk-meta"></span>
								<span class="skeleton sk-title"></span>
								<span class="skeleton sk-status"></span>
							</div>
						</div>
					{/each}
				</div>

				<div class="ppreview">
					<div class="shot skeleton shot-loading"></div>

					<div class="pinfo">
						<span class="skeleton sk-heading"></span>
						<span class="skeleton sk-description"></span>

						<div class="tags">
							<span class="skeleton sk-tag"></span>
							<span class="skeleton sk-tag"></span>
							<span class="skeleton sk-tag"></span>
						</div>
					</div>
				</div>
			{:else if projects.length > 0}
				<!-- Project index -->
				<div class="plist">
					<div class="plist-heading">
						<span>PROJECT INDEX</span>
						<span>{String(projects.length).padStart(2, '0')} ITEMS</span>
					</div>

					{#each projects as p, i (p.id)}
						<button
							type="button"
							class="prow"
							class:active={selectedIndex === i}
							aria-pressed={selectedIndex === i}
							onmouseenter={() => (pi = i)}
							onfocus={() => (pi = i)}
							onclick={() => (pi = i)}
						>
							<span class="prow-n">
								{String(i + 1).padStart(2, '0')}
							</span>

							<span class="prow-main">
								<small>{formatMetadata(p.metaData)}</small>

								<b>{p.name?.trim() || 'Untitled project'}</b>

								<span class="prow-status">
									<span
										class="status-dot"
										class:dot-progress={p.status === 'IN_PROGRESS'}
										class:dot-completed={p.status === 'COMPLETED'}
									></span>

									{getStatusLabel(p.status)}
								</span>
							</span>

							<span class="prow-arrow">
								<ArrowUpRight size={18} />
							</span>
						</button>
					{/each}

					<div class="plist-footer">
						<span>END OF INDEX</span>
						<span>SELECT TO EXPLORE</span>
					</div>
				</div>

				<!-- Selected project -->
				{#if project}
					{#key project.id}
						<div class="ppreview">
							<!-- Project visual -->
							<div class="shot" style:--tone={getTone(project.id)}>
								{#if project.image?.url}
									<button
										type="button"
										class="project-image-button"
										onclick={() => (selectedImage = project.image?.url ?? null)}
										aria-label={`Preview ${project.name} image`}
									>
										<img
											src={project.image.url}
											alt={project.name}
											class="project-image"
											loading="lazy"
											decoding="async"
										/>
									</button>
								{:else}
									<div class="shot-placeholder">
										<span class="shot-grid"></span>

										<span class="shot-initials">
											{getInitials(project.name)}
										</span>

										<span class="placeholder-label"> PROJECT PREVIEW </span>
									</div>
								{/if}

								<div class="shot-overlay"></div>

								<div class="shot-top">
									<span class="project-category">
										{formatMetadata(project.metaData)}
									</span>

									<span class="project-number">
										{String(selectedIndex + 1).padStart(2, '0')}
										/
										{String(projects.length).padStart(2, '0')}
									</span>
								</div>

								<div class="shot-bottom">
									{#if project.status === 'IN_PROGRESS'}
										<span class="status-badge status-progress">
											<span class="pulse-dot"></span>
											IN DEVELOPMENT
										</span>
									{:else if project.status === 'COMPLETED'}
										<span class="status-badge status-completed">
											<span class="completed-check">✓</span>
											COMPLETED
										</span>
									{:else}
										<span class="status-badge status-unknown"> STATUS UNAVAILABLE </span>
									{/if}
								</div>
							</div>

							<!-- Project information -->
							<div class="pinfo">
								<div class="pinfo-heading">
									<div>
										<span class="pinfo-eyebrow">PROJECT OVERVIEW</span>

										<h3>
											{project.name?.trim() || 'Untitled project'}
										</h3>
									</div>
									<!--  project  -->
									<a
										class="round"
										href={resolve("/works/[id]",{id:project.id})}
										target="_blank"
										rel="noopener noreferrer"
										aria-label="Open project"
									>
										<ArrowUpRight size={18} />
									</a>
								</div>

								<p class="project-description">
									{project.description?.trim() ||
										'No description has been added to this project yet.'}
								</p>

								<!-- Skills -->
								<div class="skills-section">
									<div class="skills-heading">
										<span>BUILT WITH</span>

										<span>
											{String(project.totalSkills || project.skills?.length || 0).padStart(2, '0')}
											TECHNOLOGIES
										</span>
									</div>

									<div class="tags">
										{#if project.skills?.length}
											{#each project.skills as skill (skill.name)}
												<span class="skill-chip">
													<span class="skill-icon-wrapper">
														<SkillIcon name={skill.icon} fallback={skill.name} class="skill-icon" />
													</span>

													{skill.name}
												</span>
											{/each}
										{:else}
											<span class="skill-empty"> Technology stack not specified </span>
										{/if}
									</div>
								</div>

								<!-- Project links -->
								{#if project.livePreview || project.githubUrl}
									<div class="project-links">
										{#if project.livePreview}
											<a href={project.livePreview} target="_blank" rel="noopener noreferrer">
												Live preview
												<ArrowUpRight size={15} />
											</a>
										{/if}

										{#if project.githubUrl}
											<a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
												Source code
												<ArrowUpRight size={15} />
											</a>
										{/if}
									</div>
								{/if}
							</div>
						</div>
					{/key}
				{/if}
			{:else}
				<!-- Empty state -->
				<div class="panel-empty">
					<span class="empty-symbol">✳</span>

					<p class="empty-eyebrow">NOTHING HERE YET</p>

					<h3>No projects yet.</h3>

					<p>My selected work will appear here soon.</p>
				</div>
			{/if}
		</div>

		<div class="more reveal" use:reveal>
			<a href="/lab">
				View all work
				<ArrowRight size={16} />
			</a>
		</div>
	</div>
</section>
{#if selectedImage}
	<div
		class="image-overlay"
		role="presentation"
		onclick={(event) => {
			if (event.target === event.currentTarget) closeImage();
		}}
		onkeydown={(event) => {
			if (event.key === 'Escape') closeImage();
		}}
	>
		<button type="button" class="image-close" onclick={closeImage} aria-label="Close image preview">
			<X size={24} />
		</button>

		<img src={selectedImage} alt="Project preview" class="image-preview" />
	</div>
{/if}

<style>
	/* ═════════ Work ═════════ */

	.work {
		background: var(--c3);
	}

	/* ═════════ Panel ═════════ */

	.panel {
		display: grid;
		grid-template-columns: 0.82fr 1.35fr;
		overflow: hidden;
		border: var(--bd);
		border-radius: 24px;
		background: var(--paper);
		box-shadow: var(--sh-lg);
	}

	/* ═════════ Project index ═════════ */

	.plist {
		display: flex;
		flex-direction: column;
		min-width: 0;
		max-height: 620px;
		overflow-y: auto;
		overflow-x: hidden;
		border-right: var(--bd);
	}

	.plist-heading,
	.plist-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		padding: 20px 24px;
		font: 700 9px/1 var(--font-mono);
		letter-spacing: 0.13em;
	}

	.plist-heading {
		position: sticky;
		top: 0;
		z-index: 10;
		background: var(--paper);
		border-bottom: var(--bd);
		box-shadow: 0 4px 8px color-mix(in oklab, var(--ink) 5%, transparent);
	}

	.plist-heading span,
	.plist-footer span {
		opacity: 0.55;
	}

	.plist-footer {
		margin-top: auto;
		border-top: var(--bd);
	}

	.plist-heading {
		border-bottom: var(--bd);
	}

	.plist-footer {
		margin-top: auto;
		border-top: var(--bd);
	}

	.prow {
		position: relative;
		display: flex;
		align-items: center;
		gap: 16px;
		width: 100%;
		padding: 24px;
		border: 0;
		border-bottom: var(--bd);
		background: transparent;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
		transition:
			background 0.25s ease,
			padding 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.prow::before {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		width: 3px;
		background: var(--ink);
		content: '';
		transform: scaleY(0);
		transform-origin: center;
		transition: transform 0.25s ease;
	}

	.prow:hover,
	.prow.active {
		background: color-mix(in oklab, var(--c1) 55%, var(--paper));
	}

	.prow.active {
		padding-left: 30px;
	}

	.prow.active::before {
		transform: scaleY(1);
	}

	.prow-n {
		align-self: flex-start;
		padding-top: 5px;
		font: 700 10px/1 var(--font-mono);
		opacity: 0.45;
	}

	.prow-main {
		display: grid;
		flex: 1;
		min-width: 0;
		gap: 7px;
	}

	.prow-main small {
		overflow: hidden;
		font: 700 9px/1.2 var(--font-mono);
		letter-spacing: 0.13em;
		text-transform: uppercase;
		text-overflow: ellipsis;
		white-space: nowrap;
		opacity: 0.55;
	}

	.prow-main b {
		overflow: hidden;
		font-size: 22px;
		font-weight: 900;
		letter-spacing: -0.045em;
		line-height: 1.1;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.prow-status {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 3px;
		font: 600 10px/1 var(--font-mono);
		opacity: 0.6;
	}

	.status-dot {
		width: 6px;
		height: 6px;
		flex: 0 0 auto;
		border-radius: 50%;
		background: #999;
	}

	.dot-progress {
		background: #d98b36;
		box-shadow: 0 0 0 3px rgb(217 139 54 / 13%);
	}

	.dot-completed {
		background: #329d70;
		box-shadow: 0 0 0 3px rgb(50 157 112 / 13%);
	}

	.prow-arrow {
		display: grid;
		place-items: center;
		width: 34px;
		height: 34px;
		flex: 0 0 auto;
		border: var(--bd);
		border-radius: 50%;
		opacity: 0;
		transform: translate(-5px, 5px);
		transition:
			opacity 0.25s ease,
			transform 0.25s ease;
	}

	.prow:hover .prow-arrow,
	.prow.active .prow-arrow {
		opacity: 1;
		transform: translate(0);
	}

	/* ═════════ Preview ═════════ */

	.ppreview {
		display: flex;
		flex-direction: column;
		min-width: 0;
		gap: 22px;
		padding: 24px;
		animation: project-enter 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both;
	}

	@keyframes project-enter {
		from {
			opacity: 0;
			transform: translateY(12px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* ═════════ Project visual ═════════ */

	.shot {
		position: relative;
		isolation: isolate;
		display: grid;
		min-height: 260px;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		border: var(--bd);
		border-radius: 17px;
		background: var(--tone);
	}

	.shot-placeholder {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.shot-placeholder {
		z-index: 0;
		display: grid;
		place-content: center;
		justify-items: center;
		gap: 10px;
		overflow: hidden;
		background: var(--tone);
		color: white;
	}

	.shot-grid {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgb(255 255 255 / 8%) 1px, transparent 1px),
			linear-gradient(90deg, rgb(255 255 255 / 8%) 1px, transparent 1px);
		background-size: 32px 32px;
		mask-image: linear-gradient(to bottom, black, transparent 95%);
	}

	.shot-initials {
		font-size: clamp(90px, 13vw, 170px);
		font-weight: 950;
		letter-spacing: -0.1em;
		line-height: 1;
		text-shadow: 0 8px 30px rgb(0 0 0 / 12%);
	}

	.placeholder-label {
		font: 700 9px/1 var(--font-mono);
		letter-spacing: 0.25em;
		opacity: 0.7;
	}

	.shot-overlay {
		position: absolute;
		z-index: 1;
		inset: 0;
		pointer-events: none;
		background: linear-gradient(
			180deg,
			rgb(0 0 0 / 30%),
			transparent 30%,
			transparent 55%,
			rgb(0 0 0 / 48%)
		);
	}

	.shot-top,
	.shot-bottom {
		position: absolute;
		z-index: 2;
		right: 16px;
		left: 16px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}

	.shot-top {
		top: 16px;
	}

	.shot-bottom {
		bottom: 16px;
	}

	.project-category,
	.project-number,
	.status-badge {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 8px 11px;
		border: 1px solid rgb(255 255 255 / 25%);
		border-radius: 999px;
		background: rgb(15 18 20 / 42%);
		color: white;
		backdrop-filter: blur(12px);
		font: 700 9px/1 var(--font-mono);
		letter-spacing: 0.09em;
		text-transform: uppercase;
	}

	.project-number {
		font-variant-numeric: tabular-nums;
	}

	/* ═════════ Status ═════════ */

	.status-progress {
		border-color: rgb(255 180 90 / 45%);
		color: #ffd09a;
	}

	.pulse-dot {
		width: 7px;
		height: 7px;
		flex: 0 0 auto;
		border-radius: 50%;
		background: #f5aa59;
		box-shadow: 0 0 0 0 rgb(245 170 89 / 60%);
		animation: pulse 1.8s infinite;
	}

	.status-completed {
		border-color: rgb(117 222 166 / 40%);
		color: #a5f0c5;
	}

	.completed-check {
		font-size: 12px;
	}

	.status-unknown {
		color: #ddd;
	}

	@keyframes pulse {
		70% {
			box-shadow: 0 0 0 6px rgb(245 170 89 / 0%);
		}

		100% {
			box-shadow: 0 0 0 0 rgb(245 170 89 / 0%);
		}
	}

	/* ═════════ Project information ═════════ */

	.pinfo {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.pinfo-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 15px;
	}

	.pinfo-eyebrow,
	.skills-heading {
		font: 700 9px/1 var(--font-mono);
		letter-spacing: 0.16em;
		opacity: 0.5;
	}

	.pinfo h3 {
		margin: 9px 0 0;
		font-size: clamp(30px, 4vw, 42px);
		font-weight: 950;
		letter-spacing: -0.06em;
		line-height: 1;
		overflow-wrap: anywhere;
	}

	.round {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		flex: 0 0 auto;
		border: var(--bd);
		border-radius: 50%;
		color: inherit;
		text-decoration: none;
		transition:
			background 0.25s ease,
			transform 0.25s ease;
	}

	.ppreview:hover .round {
		background: var(--c1);
		transform: rotate(45deg);
	}

	.project-description {
		max-width: 600px;
		margin: 15px 0 24px;
		font-size: 14px;
		line-height: 1.75;
		opacity: 0.7;
	}

	/* ═════════ Skills ═════════ */

	.skills-section {
		min-width: 0;
	}

	.skills-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		padding-bottom: 12px;
		border-bottom: var(--bd);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 9px;
		padding-top: 14px;
	}

	.skill-chip {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 8px 11px;
		border: var(--bd);
		border-radius: 9px;
		background: color-mix(in oklab, var(--paper) 90%, var(--c1));
		font: 650 11px/1 var(--font-mono);
		transition:
			transform 0.2s ease,
			background 0.2s ease;
	}

	.skill-chip:hover {
		transform: translateY(-3px);
		background: var(--c1);
	}

	.skill-empty {
		font: 500 11px/1.5 var(--font-mono);
		opacity: 0.5;
	}

	/* ═════════ Project links ═════════ */

	.project-links {
		display: flex;
		flex-wrap: wrap;
		gap: 18px;
		margin-top: 23px;
		padding-top: 17px;
		border-top: var(--bd);
	}

	.project-links a {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font: 800 10px/1 var(--font-mono);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		text-decoration: none;
		transition: gap 0.2s ease;
	}

	.project-links a:hover {
		gap: 12px;
	}

	/* ═════════ Loading skeleton ═════════ */

	.skeleton {
		display: block;
		overflow: hidden;
		border-radius: 6px;
		background: linear-gradient(90deg, #dedbd4 25%, #f0ede7 50%, #dedbd4 75%);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite linear;
	}

	.loading-row {
		cursor: default;
	}

	.sk-number {
		width: 20px;
		height: 10px;
	}

	.sk-meta {
		width: 90px;
		height: 9px;
	}

	.sk-title {
		width: 150px;
		height: 20px;
	}

	.sk-status {
		width: 95px;
		height: 9px;
	}

	.sk-heading {
		width: 55%;
		height: 36px;
	}

	.sk-description {
		width: 90%;
		height: 14px;
		margin: 14px 0;
	}

	.sk-tag {
		width: 70px;
		height: 28px;
		border-radius: 999px;
	}

	.shot-loading {
		min-height: 260px;
		border: 0;
	}

	@keyframes shimmer {
		to {
			background-position: -200% 0;
		}
	}

	/* ═════════ Empty state ═════════ */

	.panel-empty {
		grid-column: 1 / -1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		min-height: 360px;
		padding: 32px;
		text-align: center;
	}

	.empty-symbol {
		font-size: 42px;
		opacity: 0.45;
	}

	.empty-eyebrow {
		margin: 0;
		font: 700 9px/1 var(--font-mono);
		letter-spacing: 0.16em;
		opacity: 0.5;
	}

	.panel-empty h3 {
		margin: 0;
		font-size: 24px;
		font-weight: 900;
	}

	.panel-empty p:last-child {
		margin: 0;
		font-size: 13px;
		opacity: 0.6;
	}

	/* ═════════ More link ═════════ */

	.more {
		display: flex;
		justify-content: flex-end;
		margin-top: 26px;
		padding-top: 22px;
		border-top: 2px solid var(--ink);
	}

	.more a {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		font: 800 11px/1 var(--font-mono);
		letter-spacing: 0.14em;
		text-transform: uppercase;
		text-decoration: none;
		transition: gap 0.2s ease;
	}

	.more a:hover {
		gap: 16px;
	}

	/* ═════════ Responsive ═════════ */

	@media (max-width: 850px) {
		.panel {
			grid-template-columns: 0.9fr 1.1fr;
		}

		.prow {
			gap: 11px;
			padding: 20px 16px;
		}

		.prow.active {
			padding-left: 21px;
		}

		.prow-main b {
			font-size: 19px;
		}

		.ppreview {
			padding: 18px;
		}

		.plist-heading,
		.plist-footer {
			padding-right: 16px;
			padding-left: 16px;
		}
	}

	.plist::-webkit-scrollbar {
		width: 8px;
	}
	.plist::-webkit-scrollbar-track {
		background: transparent;
		margin-block: 12px;
	}
	.plist::-webkit-scrollbar-thumb {
		background: color-mix(in oklab, var(--ink) 25%, transparent);
		border-radius: 999px;
		border: 1px solid transparent;
		background-clip: padding-box;
	}

	.plist::-webkit-scrollbar-thumb:hover {
		background: color-mix(in oklab, var(--ink) 50%, transparent);
		background-clip: padding-box;
	}
	@media (max-width: 650px) {
		.panel {
			grid-template-columns: 1fr;
		}

		.plist {
			max-height: 300px;
			overflow-y: auto;
			overflow-x: hidden;

			scrollbar-width: thin;
			scrollbar-color: color-mix(in oklab, var(--ink) 30%, transparent) transparent;
		}

		.plist-heading {
			position: sticky;
			top: 0;
			z-index: 5;
			background: var(--paper);
		}

		.plist-footer {
			display: none;
		}

		.prow {
			padding: 17px 20px;
		}

		.prow.active {
			padding-left: 26px;
		}

		.prow-arrow {
			opacity: 1;
			transform: none;
		}

		.ppreview {
			gap: 20px;
			padding: 18px;
		}

		.shot {
			min-height: 210px;
		}

		.shot-initials {
			font-size: clamp(75px, 23vw, 125px);
		}

		.pinfo h3 {
			font-size: 32px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ppreview,
		.pulse-dot,
		.skeleton {
			animation: none !important;
		}

		* {
			scroll-behavior: auto !important;
			transition-duration: 0.01ms !important;
		}
	}
	.project-image-button {
		display: block;
		width: 100%;
		height: 100%;
		cursor: zoom-in;
	}

	.image-overlay {
		position: fixed;
		inset: 0;
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background: rgb(0 0 0 / 85%);
		backdrop-filter: blur(8px);
	}

	.image-preview {
		max-width: 90vw;
		max-height: 88vh;
		object-fit: contain;
		border-radius: 4px;
		animation: image-enter 180ms ease-out;
	}

	.image-close {
		position: absolute;
		top: 1.5rem;
		right: 1.5rem;
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		color: white;
		background: rgb(255 255 255 / 10%);
		cursor: pointer;
	}

	.image-close:hover {
		background: rgb(255 255 255 / 20%);
	}

	@keyframes image-enter {
		from {
			opacity: 0;
			transform: scale(0.96);
		}

		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
