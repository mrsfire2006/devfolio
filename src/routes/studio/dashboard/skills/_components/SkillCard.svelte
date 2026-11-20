<script lang="ts">
	import { ArrowUpRight, Trash2, X } from '@lucide/svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import type { SkillCard as SkillData } from '#lib/dtos/skill.ts';

	import SkillIcon from './SkillIcon.svelte';

	let { skill, onDelete }: { skill: SkillData; onDelete: (id: string) => void } = $props();

	let confirming = $state(false);
</script>

<Card.Root
	class="group relative w-full min-w-0 gap-0 overflow-hidden rounded-none border-border bg-card py-0 transition-[border-color,min-height] duration-200 hover:border-primary/50 {confirming
		? 'min-h-57.5'
		: ''}"
>
	<!-- Top accent -->
	<div
		class="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-primary transition-transform duration-200 group-hover:scale-x-100"
	></div>

	<Card.Content class="flex min-w-0 flex-col gap-4 p-4 sm:gap-5 sm:p-5">
		<!-- Icon + Actions -->
		<div class="flex min-w-0 items-start justify-between gap-3">
			<div
				class="flex size-10 shrink-0 items-center justify-center bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground sm:size-11"
			>
				<SkillIcon name={skill.icon} fallback={skill.name} class="size-5" />
			</div>

			<div class="flex shrink-0 items-center gap-1">
				<span class="font-mono text-[9px] tracking-[0.12em] text-muted-foreground/70"> SKILL </span>

				<Button
					type="button"
					variant="ghost"
					size="icon"
					onclick={() => (confirming = true)}
					aria-label="Delete {skill.name}"
					class="size-8 shrink-0 rounded-none text-muted-foreground opacity-100 transition-colors hover:bg-destructive/10 hover:text-destructive md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
				>
					<Trash2 class="size-3.5" />
				</Button>
			</div>
		</div>

		<!-- Skill information -->
		<div class="min-w-0">
			<div class="flex min-w-0 items-start justify-between gap-2">
				<h3
					class="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight text-foreground sm:text-base"
				>
					{skill.name}
				</h3>

				<ArrowUpRight
					class="mt-0.5 size-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-primary"
				/>
			</div>

			<p
				class="mt-2 line-clamp-2 min-h-10 text-sm leading-5
					{skill.description ? 'text-muted-foreground' : 'text-muted-foreground/50 italic'}"
			>
				{skill.description ?? 'No description'}
			</p>
		</div>

		<!-- Footer -->
		<div class="flex min-w-0 items-center justify-between gap-2 border-t border-border pt-3">
			<span class="truncate font-mono text-[9px] tracking-[0.12em] text-muted-foreground">
				TECHNOLOGY
			</span>

			<span class="size-1.5 shrink-0 bg-primary/70"></span>
		</div>
	</Card.Content>

	<!-- Responsive delete confirmation -->
	<!-- Delete confirmation -->
	{#if confirming}
		<div
			class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-card/95 p-3 text-center backdrop-blur-sm"
			role="alertdialog"
			aria-label="Confirm skill deletion"
		>
			<div class="flex size-9 items-center justify-center bg-destructive/10 text-destructive">
				<Trash2 class="size-4" />
			</div>

			<div class="min-w-0">
				<h4 class="text-sm font-semibold text-foreground">Delete skill?</h4>

				<p class="mt-1 text-xs leading-relaxed text-muted-foreground">
					Delete <span class="font-medium text-foreground">{skill.name}</span>?
				</p>
			</div>

			<div class="flex w-full max-w-56 gap-2">
				<Button
					type="button"
					variant="outline"
					class="h-9 min-w-0 flex-1 rounded-none px-2"
					onclick={() => (confirming = false)}
				>
					<X />
					<span class="hidden md:inline">Cancel</span>
				</Button>

				<Button
					type="button"
					variant="destructive"
					class="h-9 min-w-0 flex-1 rounded-none px-2"
					onclick={() => {
						confirming = false;
						onDelete(skill.id);
					}}
				>
					<Trash2 class="size-3.5 shrink-0" />
					<span class="hidden md:inline">Delete</span>
				</Button>
			</div>
		</div>
	{/if}
</Card.Root>
