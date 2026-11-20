<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	import {
		ArrowLeft,
		ArrowUpRight,
		CalendarDays,
		CheckCircle2,
		CircleDot,
		Clock3,
		FolderOpen,
		ImageOff,
		ImagePlus,
		LoaderCircle,
		RefreshCw,
		Trash2,
		X
	} from '@lucide/svelte';

	import { Button } from '#lib/components/ui/button/index.js';
	import { getProject } from '#lib/queries/projects.ts';
	import SkillIcon from '../../skills/_components/SkillIcon.svelte';

	const projectQuery = getProject(() => page.params.id!, 'PRIVATE', true);
	const project = $derived(projectQuery.data?.value ?? null);

	// Reactive DOM reference in Svelte 5
	let fileInput = $state<HTMLInputElement | undefined>(undefined);

	let imageUploading = $state(false);
	let deletingImageId = $state<string | null>(null);
	let deletingSkillId = $state<string | null>(null);
	let actionError = $state('');

	function formatDate(value: Date | string) {
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		}).format(new Date(value));
	}

	async function uploadImage(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];

		if (!file || !project || imageUploading || deletingImageId || deletingSkillId) return;

		imageUploading = true;
		actionError = '';

		try {
			const formData = new FormData();
			formData.append('image', file);

			const response = await fetch(resolve('/api/admin/projects/[id]/images', { id: project.id }), {
				method: 'POST',
				body: formData
			});

			const result = await response.json().catch(() => null);

			if (!response.ok || result?.isSuccess === false) {
				actionError =
					result?.errorMsg ?? result?.message ?? result?.error ?? 'Failed to upload image.';
				return;
			}

			if (fileInput) fileInput.value = '';

			await projectQuery.refetch();
		} catch {
			actionError = 'Something went wrong while uploading.';
		} finally {
			imageUploading = false;
		}
	}

	async function deleteImage(imageId: string) {
		if (!project || deletingImageId || imageUploading || deletingSkillId) return;

		deletingImageId = imageId;
		actionError = '';

		try {
			const response = await fetch(
				resolve('/api/admin/projects/[id]/images/[imageId]', {
					id: project.id,
					imageId
				}),
				{ method: 'DELETE' }
			);

			const result = await response.json().catch(() => null);

			if (!response.ok || result?.isSuccess === false) {
				actionError =
					result?.errorMsg ?? result?.message ?? result?.error ?? 'Failed to delete image.';
				return;
			}

			await projectQuery.refetch();
		} catch {
			actionError = 'Something went wrong while deleting the image.';
		} finally {
			deletingImageId = null;
		}
	}

	async function deleteSkill(skillId: string) {
		if (!project || deletingSkillId || imageUploading || deletingImageId) return;

		deletingSkillId = skillId;
		actionError = '';

		try {
			const response = await fetch(
				resolve('/api/admin/projects/[id]/skills/[skillId]', {
					id: project.id,
					skillId
				}),
				{ method: 'DELETE' }
			);

			const result = await response.json().catch(() => null);

			if (!response.ok || result?.isSuccess === false) {
				actionError =
					result?.errorMsg ?? result?.message ?? result?.error ?? 'Failed to remove skill.';
				return;
			}

			await projectQuery.refetch();
		} catch {
			actionError = 'Something went wrong while removing the skill.';
		} finally {
			deletingSkillId = null;
		}
	}
</script>

<svelte:head>
	<title>{project ? `${project.name} — Devfolio` : 'Project — Devfolio'}</title>
	<meta name="description" content={project?.description ?? 'Project details and technologies.'} />
</svelte:head>

<div class="@container/project mx-auto w-full max-w-[1600px] min-w-0">
	<main class="min-h-dvh min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
		<!-- Back -->
		<a
			href={resolve('/studio/dashboard/projects')}
			class="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary sm:mb-8"
		>
			<ArrowLeft class="size-4" />
			Projects
		</a>

		<!-- Loading -->
		{#if projectQuery.isPending}
			<div class="space-y-6" aria-busy="true">
				<div class="h-3 w-32 animate-pulse bg-muted"></div>
				<div class="h-10 max-w-md animate-pulse bg-muted"></div>
				<div class="h-5 max-w-lg animate-pulse bg-muted"></div>

				<div class="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
					<div class="aspect-video animate-pulse bg-card"></div>
					<div class="h-64 animate-pulse bg-card"></div>
				</div>
			</div>
		{:else if projectQuery.isError || projectQuery.data?.isSuccess === false}
			<section
				class="flex min-h-64 flex-col items-center justify-center gap-4 border border-border bg-card p-5 text-center sm:p-8"
			>
				<FolderOpen class="size-8 text-destructive" />

				<div>
					<h1 class="text-lg font-semibold text-foreground">Couldn't load project</h1>
					<p class="mt-2 text-sm break-words text-muted-foreground">
						{projectQuery.data?.errorMsg ?? 'Something went wrong. Try again.'}
					</p>
				</div>

				<Button
					type="button"
					variant="outline"
					class="rounded-none"
					onclick={() => projectQuery.refetch()}
				>
					<RefreshCw class="size-4" />
					Try again
				</Button>
			</section>
		{:else if !project}
			<section
				class="flex min-h-64 flex-col items-center justify-center border border-border p-6 text-center"
			>
				<FolderOpen class="size-8 text-muted-foreground" />
				<h1 class="mt-4 text-lg font-semibold text-foreground">Project not found</h1>
				<p class="mt-2 text-sm text-muted-foreground">This project may have been removed.</p>

				<a
					href={resolve('/studio/dashboard/projects')}
					class="mt-4 text-sm text-primary hover:underline"
				>
					Back to projects
				</a>
			</section>
		{:else}
			<!-- Header -->
			<header class="mb-7 min-w-0 sm:mb-8">
				<p class="mb-3 font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
					PROJECT DETAILS
				</p>

				<div
					class="flex min-w-0 flex-col gap-4 sm:gap-5 lg:flex-row lg:items-start lg:justify-between"
				>
					<div class="min-w-0 flex-1">
						<h1
							class="text-3xl font-semibold tracking-[-0.055em] [overflow-wrap:anywhere] break-words text-foreground sm:text-4xl lg:text-5xl"
						>
							{project.name}<span class="text-primary">.</span>
						</h1>

						<p
							class="mt-3 max-w-2xl text-sm leading-relaxed break-words whitespace-pre-wrap text-muted-foreground sm:text-base"
						>
							{project.description || 'No description has been added yet.'}
						</p>
					</div>

					<div class="flex shrink-0 flex-wrap items-center gap-2">
						<span
							class="inline-flex items-center gap-1.5 border px-3 py-2 text-xs font-medium
								{project.status === 'COMPLETED'
								? 'border-blue/30 bg-blue/10 text-blue'
								: project.status === 'IN_PROGRESS'
									? 'border-gold/30 bg-gold/10 text-gold'
									: 'border-border bg-muted text-muted-foreground'}"
						>
							{#if project.status === 'COMPLETED'}
								<CheckCircle2 class="size-3.5" />
								Completed
							{:else if project.status === 'IN_PROGRESS'}
								<CircleDot class="size-3.5" />
								In progress
							{:else}
								<Clock3 class="size-3.5" />
								No status
							{/if}
						</span>

						{#if project.githubUrl}
							<a
								href={project.githubUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex min-h-9 w-full items-center justify-center gap-2 border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary sm:w-auto"
							>
								<!-- <Github class="size-4" /> -->
								View repo
								<ArrowUpRight class="size-3.5" />
							</a>
						{/if}
					</div>
				</div>
			</header>

			<!-- Action error -->
			{#if actionError}
				<div
					class="mb-5 flex min-w-0 items-start gap-3 border border-destructive/30 bg-destructive/10 px-3 py-3"
				>
					<p role="alert" class="min-w-0 flex-1 text-sm break-words text-destructive">
						{actionError}
					</p>

					<button
						type="button"
						aria-label="Dismiss error"
						class="shrink-0 text-destructive hover:opacity-70"
						onclick={() => (actionError = '')}
					>
						<X class="size-4" />
					</button>
				</div>
			{/if}

			<!-- Main layout -->
			<div
				class="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px] xl:gap-6"
			>
				<div class="min-w-0 space-y-5">
					<!-- Gallery -->
					<section class="min-w-0 border border-border bg-card">
						<div
							class="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
						>
							<div class="min-w-0">
								<p class="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">VISUALS</p>

								<h2 class="mt-1 text-base font-semibold text-foreground">Project gallery</h2>

								<p class="mt-1 text-xs text-muted-foreground">
									{project.images.length}
									{project.images.length === 1 ? 'image' : 'images'}
								</p>
							</div>

							<input
								bind:this={fileInput}
								type="file"
								accept="image/jpeg,image/png,image/webp"
								class="hidden"
								disabled={imageUploading || deletingImageId !== null || deletingSkillId !== null}
								onchange={uploadImage}
							/>

							<Button
								type="button"
								class="w-full shrink-0 rounded-none sm:w-auto"
								disabled={imageUploading || deletingImageId !== null || deletingSkillId !== null}
								onclick={() => fileInput?.click()}
							>
								{#if imageUploading}
									<LoaderCircle class="size-4 animate-spin" />
									Uploading...
								{:else}
									<ImagePlus class="size-4" />
									Add image
								{/if}
							</Button>
						</div>

						{#if project.images.length > 0}
							<div
								class="flex snap-x snap-mandatory scrollbar-thin [scrollbar-color:var(--border)_transparent] gap-3 overflow-x-auto overscroll-x-contain p-3 sm:gap-4 sm:p-4"
							>
								{#each project.images as image, index (image.id)}
									<div
										class="group/image relative max-w-[85%] min-w-[85%] shrink-0 snap-start overflow-hidden border border-border bg-background sm:max-w-[48%] sm:min-w-[48%] xl:max-w-[40%] xl:min-w-[40%]"
									>
										<img
											src={image.url}
											alt="{project.name} — image {index + 1}"
											loading="lazy"
											class="aspect-video w-full object-cover transition-transform duration-300 group-hover/image:scale-[1.02]"
										/>

										<span
											class="absolute right-2 bottom-2 bg-background/80 px-2 py-1 font-mono text-[10px] text-foreground backdrop-blur-sm"
										>
											{String(index + 1).padStart(2, '0')}
											<span class="text-muted-foreground"
												>/ {String(project.images.length).padStart(2, '0')}</span
											>
										</span>

										<button
											type="button"
											aria-label="Delete image {index + 1}"
											title="Delete image"
											disabled={deletingImageId !== null ||
												imageUploading ||
												deletingSkillId !== null}
											onclick={() => deleteImage(image.id)}
											class="absolute top-2 right-2 flex size-9 items-center justify-center border border-border bg-background/90 text-foreground backdrop-blur transition-colors hover:border-destructive hover:bg-destructive hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:opacity-0 sm:group-hover/image:opacity-100 sm:focus-visible:opacity-100"
										>
											{#if deletingImageId === image.id}
												<LoaderCircle class="size-4 animate-spin" />
											{:else}
												<Trash2 class="size-4" />
											{/if}
										</button>
									</div>
								{/each}
							</div>
						{:else}
							<div
								class="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center sm:min-h-64"
							>
								<ImageOff class="size-7 text-muted-foreground" />
								<p class="text-sm text-muted-foreground">No project images yet.</p>

								<Button
									type="button"
									variant="outline"
									class="rounded-none"
									disabled={imageUploading || deletingSkillId !== null}
									onclick={() => fileInput?.click()}
								>
									<ImagePlus class="size-4" />
									Upload first image
								</Button>
							</div>
						{/if}
					</section>

					<!-- Description -->
					<section class="min-w-0 border border-border bg-card p-4 sm:p-5">
						<div class="flex items-center gap-3">
							<span
								class="flex size-9 shrink-0 items-center justify-center bg-primary/10 text-primary"
							>
								<FolderOpen class="size-4" />
							</span>

							<h2 class="text-base font-semibold text-foreground">About this project</h2>
						</div>

						<p
							class="mt-4 text-sm leading-7 [overflow-wrap:anywhere] break-words whitespace-pre-wrap text-muted-foreground"
						>
							{project.description || 'No description has been added yet.'}
						</p>
					</section>

					<!-- Skills -->
					<section class="min-w-0 border border-border bg-card p-4 sm:p-5">
						<div class="flex items-center justify-between gap-3">
							<div class="min-w-0">
								<p class="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
									TECH STACK
								</p>

								<h2 class="mt-1 text-base font-semibold text-foreground">Skills</h2>
							</div>

							<span class="shrink-0 text-xs text-muted-foreground tabular-nums">
								{project.skills.length}
							</span>
						</div>

						{#if project.skills.length > 0}
							<div class="mt-5 flex min-w-0 flex-wrap gap-3">
								{#each project.skills as skill (skill.id)}
									<div
										class="group/skill relative inline-flex max-w-full min-w-0 items-center gap-2 border border-border bg-background py-2 pr-8 pl-2.5"
									>
										<span
											class="flex size-6 shrink-0 items-center justify-center bg-primary/10 text-primary"
										>
											<SkillIcon name={skill.icon} fallback={skill.name} class="size-4" />
										</span>

										<span class="text-sm [overflow-wrap:anywhere] break-words text-foreground">
											{skill.name}
										</span>

										<button
											type="button"
											aria-label="Remove {skill.name} from project"
											title="Remove skill"
											disabled={deletingSkillId !== null ||
												imageUploading ||
												deletingImageId !== null}
											onclick={() => deleteSkill(skill.id)}
											class="absolute -top-2 -right-2 z-10 flex size-6 items-center justify-center border border-border bg-card text-muted-foreground transition-colors hover:border-destructive hover:bg-destructive hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:opacity-0 sm:group-hover/skill:opacity-100 sm:focus-visible:opacity-100"
										>
											{#if deletingSkillId === skill.id}
												<LoaderCircle class="size-3.5 animate-spin" />
											{:else}
												<X class="size-3.5" />
											{/if}
										</button>
									</div>
								{/each}
							</div>
						{:else}
							<p class="mt-4 text-sm text-muted-foreground">No skills linked to this project.</p>
						{/if}
					</section>
				</div>

				<!-- Project information -->
				<aside class="min-w-0 space-y-5">
					<section class="min-w-0 border border-border bg-card">
						<div class="border-b border-border px-4 py-4 sm:px-5">
							<p class="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">OVERVIEW</p>

							<h2 class="mt-1 text-base font-semibold text-foreground">Project information</h2>
						</div>

						<div class="px-4 sm:px-5">
							<div class="flex items-start gap-3 border-b border-border py-4">
								<CalendarDays class="mt-0.5 size-4 shrink-0 text-muted-foreground" />

								<div class="min-w-0">
									<p class="text-xs text-muted-foreground">Created</p>
									<p class="mt-1 text-sm font-medium break-words text-foreground">
										{formatDate(project.createdAt)}
									</p>
								</div>
							</div>

							<div class="flex items-start gap-3 border-b border-border py-4">
								<RefreshCw class="mt-0.5 size-4 shrink-0 text-muted-foreground" />

								<div class="min-w-0">
									<p class="text-xs text-muted-foreground">Last updated</p>
									<p class="mt-1 text-sm font-medium break-words text-foreground">
										{formatDate(project.updatedAt)}
									</p>
								</div>
							</div>

							<div class="flex items-start gap-3 py-4">
								<FolderOpen class="mt-0.5 size-4 shrink-0 text-muted-foreground" />

								<div class="min-w-0">
									<p class="text-xs text-muted-foreground">Images</p>
									<p class="mt-1 text-sm font-medium text-foreground">
										{project.images.length}
									</p>
								</div>
							</div>

							<div class="flex items-start gap-3 border-t border-border py-4">
								<CheckCircle2 class="mt-0.5 size-4 shrink-0 text-muted-foreground" />

								<div class="min-w-0">
									<p class="text-xs text-muted-foreground">Skills</p>
									<p class="mt-1 text-sm font-medium text-foreground">
										{project.skills.length}
									</p>
								</div>
							</div>
						</div>
					</section>

					<!-- Repository -->
					{#if project.githubUrl}
						<a
							href={project.githubUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="flex min-w-0 items-center gap-3 border border-border bg-card p-4 transition-colors hover:border-primary/50"
						>
							<span
								class="flex size-10 shrink-0 items-center justify-center bg-muted text-foreground"
							>
								<!-- <Github class="size-5" /> -->
							</span>

							<span class="min-w-0 flex-1">
								<span class="block text-sm font-semibold text-foreground">View repo</span>
								<span class="mt-1 block text-xs text-muted-foreground">Open on GitHub</span>
							</span>

							<ArrowUpRight class="size-4 shrink-0 text-muted-foreground" />
						</a>
					{/if}
				</aside>
			</div>
		{/if}
	</main>
</div>
