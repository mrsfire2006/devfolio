<script lang="ts">
	import {
		AlignLeft,
		BadgeCheck,
		CircleCheck,
		CircleDot,
		Flag,
		Globe,
		Layers,
		Link2,
		LoaderCircle,
		Pencil,
		TriangleAlert,
		X
	} from '@lucide/svelte';
	import * as Dialog from '#lib/components/ui/dialog/index.js';

	import AppDialog from '#lib/components/shared/AppDialog.svelte';
	import { ClientFetch } from '#lib/client-fetch.ts';
	import { getSkills } from '#lib/queries/skills.ts';
	import { resolve } from '$app/paths';
	import SkillIcon from '../../skills/_components/SkillIcon.svelte';
	import SkillPicker from './SkillPicker.svelte';
	import type { ProjectStatus } from '#lib/server/db/schemas/project.schema.ts';
	import type { PrivateProjectCard } from '#lib/dtos/project/private.ts';

	interface Props {
		project: PrivateProjectCard;
		open: boolean;
		onClose: () => void;
		onUpdated: () => void | Promise<unknown>;
	}
	let { project, open, onClose, onUpdated }: Props = $props();

	let name = $state(project.name);
	let description = $state(project.description ?? '');
	let githubUrl = $state(project.githubUrl ?? '');
	let livePreview = $state(project.livePreview ?? '');
	let appType = $state(project.metaData ?? '');
	let status = $state<ProjectStatus>(project.status ?? 'IN_PROGRESS');
	let submitting = $state(false);
	let errorMessage = $state('');

	// ── Skills ──
	const skills = getSkills();
	const allSkills = $derived(skills.data?.value ?? []);

	const attached = $derived(project.skills ?? []);
	const attachedIds = $derived(attached.map((s) => s.id));

	let newIds = $state<string[]>([]);
	const newSkills = $derived(allSkills.filter((s) => newIds.includes(s.id)));

	const field =
		'w-full rounded-none border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground hover:border-foreground/25 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40';

	const statuses = [
		{
			value: 'IN_PROGRESS',
			label: 'In progress',
			icon: CircleDot,
			active: 'border-gold bg-gold/10 text-gold'
		},
		{
			value: 'COMPLETED',
			label: 'Completed',
			icon: CircleCheck,
			active: 'border-blue bg-blue/10 text-blue'
		}
	] as const;

	$effect(() => {
		name = project.name;
		description = project.description ?? '';
		githubUrl = project.githubUrl ?? '';
		livePreview = project.livePreview ?? '';
		appType = project.metaData ?? '';
		status = project.status ?? 'IN_PROGRESS';
		errorMessage = '';
		newIds = [];
	});

	async function updateProject(event: SubmitEvent) {
		event.preventDefault();

		const cleanName = name.trim();
		if (!cleanName || submitting) return;

		submitting = true;
		errorMessage = '';

		try {
			const result = await ClientFetch(resolve('/api/admin/projects/[id]', { id: project.id }), {
				method: 'PATCH',
				body: JSON.stringify({
					name: cleanName,
					description: description.trim() || null,
					githubUrl: githubUrl.trim() || null,
					livePreview: livePreview.trim() || null,
					metaData: appType.trim() || null,
					status
				})
			});

			if (!result.isSuccess) {
				throw new Error(result.errorMsg ?? 'Failed to update project');
			}

			if (newIds.length) {
				const results = await Promise.all(
					newIds.map((skillId) =>
						ClientFetch(resolve('/api/admin/projects/[id]/skills', { id: project.id }), {
							method: 'POST',
							body: JSON.stringify({ skillId })
						})
					)
				);

				const failed = results.find((r) => !r.isSuccess);
				if (failed) throw new Error(failed.errorMsg ?? 'Failed to add skills');
			}

			await onUpdated();
			onClose();
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Failed to update project';
		} finally {
			submitting = false;
		}
	}
</script>

<AppDialog
	{open}
	onOpenChange={(value) => !value && !submitting && onClose()}
	triggerClass="hidden"
	contentClass="max-h-[90dvh] overflow-y-auto rounded-none"
>
	{#snippet trigger()}
		<Pencil class="size-4" />
		Edit project
	{/snippet}

	{#snippet header()}
		<div class="flex items-center gap-3">
			<span class="flex size-10 shrink-0 items-center justify-center bg-violet/15 text-violet">
				<Pencil class="size-5" />
			</span>
			<div class="min-w-0">
				<Dialog.Title>Edit project</Dialog.Title>
				<Dialog.Description class="truncate">Update “{project.name}”.</Dialog.Description>
			</div>
		</div>
	{/snippet}

	{#snippet content()}
		<form id="edit-project-form" onsubmit={updateProject} class="mt-5 space-y-5">
			<div class="space-y-1.5">
				<label for="edit-project-name" class="flex items-center gap-1.5 text-sm font-medium">
					<Layers class="size-3.5 text-primary" />
					Project name
				</label>
				<input
					id="edit-project-name"
					bind:value={name}
					required
					maxlength={80}
					placeholder="e.g. FlowDo"
					class={field}
				/>
			</div>

			<div class="space-y-1.5">
				<label for="edit-project-description" class="flex items-center gap-1.5 text-sm font-medium">
					<AlignLeft class="size-3.5 text-blue" />
					Description
					<span class="ml-auto text-xs font-normal text-muted-foreground tabular-nums">
						{description.length}/240
					</span>
				</label>
				<textarea
					id="edit-project-description"
					bind:value={description}
					rows={3}
					maxlength={240}
					placeholder="What are you building?"
					class="{field} resize-y"></textarea>
			</div>

			<div class="space-y-1.5">
				<label for="edit-project-github" class="flex items-center gap-1.5 text-sm font-medium">
					<Link2 class="size-3.5 text-violet" />
					GitHub URL
				</label>
				<input
					id="edit-project-github"
					bind:value={githubUrl}
					type="url"
					placeholder="https://github.com/username/repository"
					class={field}
				/>
			</div>
			<div class="space-y-1.5">
				<label
					for="edit-project-live-preview"
					class="flex items-center gap-1.5 text-sm font-medium"
				>
					<Globe class="size-3.5 text-blue" />
					Live preview URL
				</label>
				<input
					id="edit-project-live-preview"
					bind:value={livePreview}
					type="url"
					placeholder="https://your-project.com"
					class={field}
				/>
			</div>
			<div class="space-y-1.5">
				<label for="edit-project-app-type" class="flex items-center gap-1.5 text-sm font-medium">
					<Layers class="size-3.5 text-violet" />
					App type
				</label>
				<input
					id="edit-project-app-type"
					bind:value={appType}
					maxlength={40}
					placeholder="e.g. Web application, Desktop app, CLI"
					class={field}
				/>
			</div>

			<div class="space-y-1.5">
				<span class="flex items-center gap-1.5 text-sm font-medium">
					<Flag class="size-3.5 text-gold" />
					Status
				</span>
				<div class="grid grid-cols-2 gap-2">
					{#each statuses as s (s.value)}
						<button
							type="button"
							aria-pressed={status === s.value}
							onclick={() => (status = s.value)}
							class="flex items-center justify-center gap-2 rounded-none border px-3 py-2.5 text-sm font-medium transition-colors
								{status === s.value
								? s.active
								: 'border-input text-muted-foreground hover:border-foreground/25 hover:text-foreground'}"
						>
							<s.icon class="size-4" />
							{s.label}
						</button>
					{/each}
				</div>
			</div>

			<!-- Skills -->
			<div class="space-y-2.5">
				<span class="flex items-center gap-1.5 text-sm font-medium">
					<BadgeCheck class="size-3.5 text-blue" />
					Skills
					{#if attached.length}
						<span class="ml-auto text-xs font-normal text-muted-foreground tabular-nums">
							{attached.length} attached
						</span>
					{/if}
				</span>

				<!-- الموجودة فعلًا -->
				{#if attached.length}
					<div class="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
						{#each attached as skill (skill.id)}
							<span
								class="inline-flex items-center gap-1.5 rounded-none border border-border bg-muted py-1 pr-2.5 pl-1 text-xs"
							>
								<span class="flex size-5 items-center justify-center bg-primary/15 text-primary">
									<SkillIcon name={skill.icon} fallback={skill.name} class="size-3" />
								</span>
								{skill.name}
							</span>
						{/each}
					</div>
				{/if}

				<SkillPicker
					skills={allSkills}
					excludeIds={attachedIds}
					bind:value={newIds}
					loading={skills.isPending}
				/>

				<!-- الجديدة (قابلة للإزالة قبل الحفظ) -->
				{#if newSkills.length}
					<div class="flex flex-wrap gap-1.5">
						{#each newSkills as skill (skill.id)}
							<span
								class="inline-flex items-center gap-1.5 rounded-none bg-primary/10 py-1 pr-1.5 pl-1 text-xs text-primary ring-1 ring-primary/25"
							>
								<span class="flex size-5 items-center justify-center bg-primary/20">
									<SkillIcon name={skill.icon} fallback={skill.name} class="size-3" />
								</span>
								{skill.name}
								<button
									type="button"
									onclick={() => (newIds = newIds.filter((x) => x !== skill.id))}
									class="flex size-4 items-center justify-center transition-colors hover:bg-destructive/15 hover:text-destructive"
									aria-label="Remove {skill.name}"
								>
									<X class="size-3" />
								</button>
							</span>
						{/each}
					</div>
				{/if}
			</div>

			{#if errorMessage}
				<p
					class="flex items-start gap-2 border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
				>
					<TriangleAlert class="mt-0.5 size-4 shrink-0" />
					{errorMessage}
				</p>
			{/if}
		</form>
	{/snippet}

	{#snippet actions()}
		<button
			type="button"
			onclick={onClose}
			disabled={submitting}
			class="rounded-none border border-border px-4 py-2.5 text-sm transition-colors hover:bg-secondary disabled:opacity-50"
		>
			Cancel
		</button>

		<button
			type="submit"
			form="edit-project-form"
			disabled={submitting || !name.trim()}
			class="inline-flex items-center gap-2 rounded-none bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
		>
			{#if submitting}
				<LoaderCircle class="size-4 animate-spin" />
				Saving...
			{:else}
				<Pencil class="size-4" />
				Save changes
			{/if}
		</button>
	{/snippet}
</AppDialog>
