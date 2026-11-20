<script lang="ts">
	import { AlignLeft, Code2, LoaderCircle, Plus, TriangleAlert } from '@lucide/svelte';

	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import AppDialog from '#lib/components/shared/AppDialog.svelte';

	import { useCreateSkill } from '#lib/queries/skills.ts';

	import IconPicker from './IconPicker.svelte';
	import SkillIcon from './SkillIcon.svelte';

	import type { Snippet } from 'svelte';

	let {
		trig,
		open = $bindable(false)
	}: {
		trig?: Snippet;
		open?: boolean;
	} = $props();

	const createSkill = useCreateSkill();

	let name = $state('');
	let description = $state('');
	let icon = $state<string | null>(null);
	let submitting = $state(false);
	let errorMessage = $state('');

	const field =
		'w-full rounded-none border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground hover:border-foreground/25 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40';

	function resetForm() {
		name = '';
		description = '';
		icon = null;
		errorMessage = '';
	}

	async function createSkillItem(event: SubmitEvent) {
		event.preventDefault();

		const cleanName = name.trim();

		if (!cleanName || submitting) return;

		submitting = true;
		errorMessage = '';

		try {
			await createSkill.mutateAsync({
				name: cleanName,
				description: description.trim() || null,
				icon
			});

			open = false;
			resetForm();
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Failed to create skill.';
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
			Add skill
		{/if}
	{/snippet}

	{#snippet header()}
		<div class="flex items-center gap-3">
			<span class="flex size-10 shrink-0 items-center justify-center bg-primary/15 text-primary">
				<Code2 class="size-5" />
			</span>

			<div class="min-w-0">
				<Dialog.Title>New skill</Dialog.Title>
				<Dialog.Description>Add a skill to your portfolio.</Dialog.Description>
			</div>
		</div>
	{/snippet}

	{#snippet content()}
		<form id="create-skill-form" onsubmit={createSkillItem} class="mt-5 space-y-5">
			<div class="space-y-1.5">
				<label for="skill-name" class="flex items-center gap-1.5 text-sm font-medium">
					<Code2 class="size-3.5 text-primary" />
					Skill name
				</label>

				<input
					id="skill-name"
					bind:value={name}
					required
					maxlength={40}
					placeholder="e.g. Rust, Svelte, PostgreSQL"
					class={field}
				/>
			</div>

			<div class="space-y-1.5">
				<label for="skill-description" class="flex items-center gap-1.5 text-sm font-medium">
					<AlignLeft class="size-3.5 text-blue" />
					Description
					<span class="ml-auto text-xs font-normal text-muted-foreground">
						{description.length}/120
					</span>
				</label>

				<textarea
					id="skill-description"
					bind:value={description}
					rows={3}
					maxlength={120}
					placeholder="What do you use it for?"
					class="{field} resize-y"></textarea>
			</div>

			<div class="space-y-2">
				<span class="flex items-center gap-1.5 text-sm font-medium">
					<Code2 class="size-3.5 text-violet" />
					Icon
					<span class="ml-auto text-xs font-normal text-muted-foreground"> Optional </span>
				</span>

				<IconPicker bind:value={icon} />
			</div>

			<!-- Preview -->
			<div class="border border-border bg-card p-4">
				<p class="mb-3 font-mono text-[10px] tracking-[0.14em] text-muted-foreground">PREVIEW</p>

				<div class="flex items-start gap-3">
					<div class="flex size-11 shrink-0 items-center justify-center bg-primary/10 text-primary">
						<SkillIcon name={icon} fallback={name || '?'} class="size-5" />
					</div>

					<div class="min-w-0 flex-1">
						<p
							class="truncate text-sm font-semibold
								{name ? 'text-foreground' : 'text-muted-foreground/50'}"
						>
							{name || 'Skill name'}
						</p>

						<p class="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
							{description || 'No description provided.'}
						</p>
					</div>
				</div>
			</div>

			{#if errorMessage}
				<p
					role="alert"
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
			form="create-skill-form"
			disabled={submitting || !name.trim()}
			class="inline-flex items-center gap-2 rounded-none bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
		>
			{#if submitting}
				<LoaderCircle class="size-4 animate-spin" />
				Creating...
			{:else}
				<Plus class="size-4" strokeWidth={2.2} />
				Create skill
			{/if}
		</button>
	{/snippet}
</AppDialog>
