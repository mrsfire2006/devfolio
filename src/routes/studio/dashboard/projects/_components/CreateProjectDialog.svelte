<script lang="ts">
	import {
		AlignLeft,
		CircleCheck,
		CircleDot,
		Flag,
		Globe,
		Layers,
		Link2,
		LoaderCircle,
		Plus,
		Rocket,
		TriangleAlert
	} from '@lucide/svelte';
	import * as Dialog from '#lib/components/ui/dialog/index.js';

	import AppDialog from '#lib/components/shared/AppDialog.svelte';
	import { ClientFetch } from '#lib/client-fetch.ts';
	import { resolve } from '$app/paths';
	import { useQueryClient } from '@tanstack/svelte-query';
	import type { Snippet } from 'svelte';
	import type { CreateProject } from '#lib/dtos/project/private.ts';

	let { trig }: { trig?: Snippet } = $props();

	let open = $state(false);
	let name = $state('');
	let description = $state('');
	let githubUrl = $state('');
	let appType = $state('');
	let livePreview = $state('');
	let status = $state<CreateProject['status']>('IN_PROGRESS');
	let submitting = $state(false);
	let errorMessage = $state('');

	const queryClient = useQueryClient();

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

	async function createProject(event: SubmitEvent) {
		event.preventDefault();

		const cleanName = name.trim();
		if (!cleanName || submitting) return;

		submitting = true;
		errorMessage = '';

		try {
			const result = await ClientFetch(resolve('/api/admin/projects'), {
				method: 'POST',
				body: JSON.stringify({
					name: cleanName,
					description: description.trim() || null,
					githubUrl: githubUrl.trim() || null,
					livePreview: livePreview.trim() || null,
					metaData: {
						appType: appType.trim() || null
					},
					status
				})
			});

			if (!result.isSuccess) {
				errorMessage = result.errorMsg ?? 'Failed to create project';
			} else {
				queryClient.invalidateQueries({ queryKey: ['projects', 'PRIVATE'] });
				open = false;
				name = '';
				description = '';
				githubUrl = '';
				livePreview = '';
				appType = '';

				status = 'IN_PROGRESS';
			}
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Failed to create project';
		} finally {
			submitting = false;
		}
	}
</script>

<AppDialog
	bind:open
	triggerClass={trig
		? ''
		: 'inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded-none bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-95'}
	contentClass="max-h-[90dvh] overflow-y-auto rounded-none"
>
	{#snippet trigger()}
		{#if trig}
			{@render trig()}
		{:else}
			<Plus class="size-4" strokeWidth={2.2} />
			Add project
		{/if}
	{/snippet}

	{#snippet header()}
		<div class="flex items-center gap-3">
			<span class="flex size-10 shrink-0 items-center justify-center bg-primary/15 text-primary">
				<Rocket class="size-5" />
			</span>
			<div class="min-w-0">
				<Dialog.Title>New project</Dialog.Title>
				<Dialog.Description>Add a new project to your portfolio.</Dialog.Description>
			</div>
		</div>
	{/snippet}

	{#snippet content()}
		<form id="create-project-form" onsubmit={createProject} class="mt-5 space-y-5">
			<div class="space-y-1.5">
				<label for="project-name" class="flex items-center gap-1.5 text-sm font-medium">
					<Layers class="size-3.5 text-primary" />
					Project name
				</label>
				<input
					id="project-name"
					bind:value={name}
					required
					maxlength={80}
					placeholder="e.g. FlowDo"
					class={field}
				/>
			</div>

			<div class="space-y-1.5">
				<label for="project-description" class="flex items-center gap-1.5 text-sm font-medium">
					<AlignLeft class="size-3.5 text-blue" />
					Description
					<span class="ml-auto text-xs font-normal text-muted-foreground tabular-nums">
						{description.length}/240
					</span>
				</label>
				<textarea
					id="project-description"
					bind:value={description}
					rows={3}
					maxlength={240}
					placeholder="What are you building?"
					class="{field} resize-y"></textarea>
			</div>

			<div class="space-y-1.5">
				<label for="project-github" class="flex items-center gap-1.5 text-sm font-medium">
					<Link2 class="size-3.5 text-violet" />
					GitHub URL
				</label>
				<input
					id="project-github"
					bind:value={githubUrl}
					type="url"
					placeholder="https://github.com/username/repository"
					class={field}
				/>
			</div>
			<div class="space-y-1.5">
				<label for="project-live-preview" class="flex items-center gap-1.5 text-sm font-medium">
					<Globe class="size-3.5 text-blue" />
					Live preview URL
				</label>
				<input
					id="project-live-preview"
					bind:value={livePreview}
					type="url"
					placeholder="https://your-project.com"
					class={field}
				/>
			</div>
			<div class="space-y-1.5">
				<label for="project-app-type" class="flex items-center gap-1.5 text-sm font-medium">
					<Layers class="size-3.5 text-violet" />
					App type
				</label>
				<input
					id="project-app-type"
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
			onclick={() => (open = false)}
			disabled={submitting}
			class="rounded-none border border-border px-4 py-2.5 text-sm transition-colors hover:bg-secondary disabled:opacity-50"
		>
			Cancel
		</button>

		<button
			type="submit"
			form="create-project-form"
			disabled={submitting || !name.trim()}
			class="inline-flex items-center gap-2 rounded-none bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
		>
			{#if submitting}
				<LoaderCircle class="size-4 animate-spin" />
				Creating...
			{:else}
				<Plus class="size-4" strokeWidth={2.2} />
				Create project
			{/if}
		</button>
	{/snippet}
</AppDialog>
