<script lang="ts">
	import { onMount } from 'svelte';

	import {
		CalendarDays,
		CircleCheck,
		CircleDot,
		UserRound,
		PanelsTopLeft,
		Link2,
		Plus,
		Trash2,
		Save
	} from '@lucide/svelte';

	import { createMutation, useQueryClient } from '@tanstack/svelte-query';

	import { resolve } from '$app/paths';

	import { ClientFetch } from '#lib/client-fetch.ts';
	import { getProfile, profileQueryKey } from '#lib/queries/profile.ts';

	import type { Profile, AboutTab, ContactLink } from '#lib/types/profile.ts';

	type ProfileSection = 'hero' | 'about' | 'contact';

	function updateHeroLine(index: number, value: string) {
		if (!draft) return;

		draft.hero.lines[index] = value;
		clearFeedback();
	}

	function updateAboutLine(tab: AboutTab, index: number, value: string) {
		tab.lines[index] = value;
		clearFeedback();
	}
	const queryClient = useQueryClient();

	// ── Query ──

	const profileQuery = getProfile();

	const profile = $derived(profileQuery.data?.value ?? null);
	// ── Editable state ──

	let original = $state<Profile | null>(null);
	let draft = $state<Profile | null>(null);

	$effect(() => {
		const fetchedProfile: unknown = profile;

		if (!fetchedProfile || draft !== null) return;

		if (!isProfile(fetchedProfile)) {
			console.error('Invalid profile response:', fetchedProfile);
			return;
		}

		original = structuredClone(fetchedProfile);
		draft = structuredClone(fetchedProfile);
	});

	const isDirty = $derived(
		original !== null &&
			draft !== null &&
			JSON.stringify($state.snapshot(original)) !== JSON.stringify($state.snapshot(draft))
	);

	// ── UI state ──

	let activeSection = $state<ProfileSection>('hero');
	let dateLabel = $state('');

	let saveError = $state('');
	let saveSuccess = $state(false);

	onMount(() => {
		dateLabel = new Intl.DateTimeFormat('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		})
			.format(new Date())
			.toUpperCase();
	});

	// ── Helpers ──

	function createId() {
		return crypto.randomUUID();
	}

	function clearFeedback() {
		saveError = '';
		saveSuccess = false;
	}

	function discardChanges() {
		if (!original || saveMutation.isPending) return;

		draft = structuredClone($state.snapshot(original));
		clearFeedback();
	}

	// ── Hero operations ──

	function addHeroLine() {
		if (!draft) return;

		draft.hero.lines = [...draft.hero.lines, ''];
		clearFeedback();
	}

	function removeHeroLine(index: number) {
		if (!draft) return;

		draft.hero.lines = draft.hero.lines.filter((_, i) => i !== index);

		clearFeedback();
	}

	// ── About operations ──

	function addAboutTab() {
		if (!draft) return;

		const tab: AboutTab = {
			id: createId(),
			title: 'New tab',
			pill: 'NEW',
			lines: [],
			text: ''
		};

		draft.about.tabs = [...draft.about.tabs, tab];
		clearFeedback();
	}

	function removeAboutTab(id: string) {
		if (!draft) return;

		draft.about.tabs = draft.about.tabs.filter((tab) => tab.id !== id);

		clearFeedback();
	}

	function addAboutLine(tab: AboutTab) {
		tab.lines = [...tab.lines, ''];
		clearFeedback();
	}

	function removeAboutLine(tab: AboutTab, index: number) {
		tab.lines = tab.lines.filter((_, i) => i !== index);

		clearFeedback();
	}

	// ── Contact operations ──

	function addContactLink() {
		if (!draft) return;

		const link: ContactLink = {
			id: createId(),
			label: 'New link',
			href: '',
			hint: ''
		};

		draft.contact.links = [...draft.contact.links, link];
		clearFeedback();
	}

	function removeContactLink(id: string) {
		if (!draft) return;

		draft.contact.links = draft.contact.links.filter((link) => link.id !== id);

		clearFeedback();
	}
	function isProfile(value: unknown): value is Profile {
		if (!value || typeof value !== 'object') return false;

		const data = value as Record<string, unknown>;
		const hero = data.hero;
		const about = data.about;
		const contact = data.contact;

		if (!hero || typeof hero !== 'object') return false;
		if (!about || typeof about !== 'object') return false;
		if (!contact || typeof contact !== 'object') return false;

		const heroData = hero as Record<string, unknown>;
		const aboutData = about as Record<string, unknown>;
		const contactData = contact as Record<string, unknown>;

		return (
			typeof data.id === 'string' &&
			typeof heroData.name === 'string' &&
			typeof heroData.headline === 'string' &&
			typeof heroData.description === 'string' &&
			Array.isArray(heroData.lines) &&
			Array.isArray(aboutData.tabs) &&
			Array.isArray(contactData.links)
		);
	}

	// ── Save mutation ──

	const saveMutation = createMutation(() => ({
		mutationFn: async (payload: Profile): Promise<Profile> => {
			const result = await ClientFetch<Profile>(resolve('/api/admin/profile'), {
				method: 'POST',
				body: JSON.stringify(payload)
			});

			if (!result.isSuccess) {
				throw new Error(result.errorMsg ?? 'Failed to save profile.');
			}

			if (!result.value) {
				throw new Error('Server returned an empty profile.');
			}

			return result.value;
		},

		onSuccess: async (savedProfile, submittedProfile) => {
			const currentDraft = draft ? $state.snapshot(draft) : null;

			const unchanged =
				currentDraft !== null && JSON.stringify(currentDraft) === JSON.stringify(submittedProfile);

			original = structuredClone(savedProfile);

			if (unchanged) {
				draft = structuredClone(savedProfile);
				saveSuccess = true;
			} else {
				saveSuccess = false;
			}

			saveError = '';

			await queryClient.invalidateQueries({
				queryKey: profileQueryKey
			});
		}
	}));

	async function saveProfile() {
		if (!draft || !isDirty || saveMutation.isPending) {
			return;
		}

		saveError = '';
		saveSuccess = false;

		const payload = structuredClone($state.snapshot(draft));

		try {
			await saveMutation.mutateAsync(payload);
		} catch (error) {
			saveError = error instanceof Error ? error.message : 'Failed to save profile.';
		}
	}
</script>

<svelte:head>
	<title>Profile — Studio</title>
</svelte:head>

<div class="@container/profile mx-auto w-full max-w-[1600px]">
	<main
		class="min-h-dvh w-full px-5
			@sm/profile:px-6
			@2xl/profile:px-8
			@2xl/profile:pt-10
			@5xl/profile:px-10"
	>
		<!-- Header -->
		<header class="mb-8">
			<p
				class="mb-4 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-muted-foreground"
			>
				<CalendarDays class="size-3.5 text-gold" />
				{dateLabel}
			</p>

			<div
				class="flex flex-col gap-5
					@2xl/profile:flex-row
					@2xl/profile:items-center
					@2xl/profile:justify-between"
			>
				<div class="min-w-0">
					<h1
						class="text-4xl font-semibold tracking-[-0.055em] text-foreground
							@sm/profile:text-5xl"
					>
						Profile
					</h1>

					<p class="mt-3 text-sm leading-relaxed text-muted-foreground @sm/profile:text-base">
						Manage your portfolio identity and public information.
					</p>
				</div>

				<div class="flex flex-wrap items-center gap-2">
					{#if isDirty}
						<button
							type="button"
							onclick={discardChanges}
							disabled={saveMutation.isPending}
							class="inline-flex h-10 items-center justify-center border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
						>
							Discard
						</button>
					{/if}

					<button
						type="button"
						onclick={saveProfile}
						disabled={!isDirty || saveMutation.isPending}
						class="inline-flex h-10 items-center justify-center gap-2 bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
					>
						<Save class="size-4" />
						{saveMutation.isPending ? 'Saving...' : 'Save changes'}
					</button>
				</div>
			</div>
		</header>

		<!-- Loading -->
		{#if profileQuery.isPending}
			<section aria-busy="true" class="space-y-5">
				<div class="h-12 animate-pulse border border-border bg-card"></div>
				<div class="h-80 animate-pulse border border-border bg-card"></div>
			</section>

			<!-- Error -->
		{:else if profileQuery.isError}
			<div
				class="flex min-h-64 flex-col items-center justify-center gap-3 border border-destructive/30 bg-destructive/5 text-center"
			>
				<p class="text-sm text-destructive">Failed to load profile.</p>

				<button
					type="button"
					onclick={() => profileQuery.refetch()}
					class="border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
				>
					Try again
				</button>
			</div>
		{:else if draft?.hero && draft.about && draft.contact}
			<!-- Section Navigation -->
			<div
				role="tablist"
				aria-label="Profile sections"
				class="mb-6 flex w-fit max-w-full items-center gap-1 overflow-x-auto border border-border bg-card p-1"
			>
				<button
					type="button"
					role="tab"
					aria-selected={activeSection === 'hero'}
					onclick={() => (activeSection = 'hero')}
					class="flex items-center gap-2 px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors
						{activeSection === 'hero'
						? 'bg-primary text-primary-foreground'
						: 'text-muted-foreground hover:bg-accent hover:text-foreground'}"
				>
					<UserRound class="size-3.5" />
					Hero
				</button>

				<button
					type="button"
					role="tab"
					aria-selected={activeSection === 'about'}
					onclick={() => (activeSection = 'about')}
					class="flex items-center gap-2 px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors
						{activeSection === 'about'
						? 'bg-gold text-background'
						: 'text-muted-foreground hover:bg-accent hover:text-foreground'}"
				>
					<PanelsTopLeft class="size-3.5" />
					About

					<span class="min-w-4 bg-background/20 px-1 text-center text-[10px] tabular-nums">
						{draft.about.tabs.length}
					</span>
				</button>

				<button
					type="button"
					role="tab"
					aria-selected={activeSection === 'contact'}
					onclick={() => (activeSection = 'contact')}
					class="flex items-center gap-2 px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors
						{activeSection === 'contact'
						? 'bg-blue text-background'
						: 'text-muted-foreground hover:bg-accent hover:text-foreground'}"
				>
					<Link2 class="size-3.5" />
					Contact

					<span class="min-w-4 bg-background/20 px-1 text-center text-[10px] tabular-nums">
						{draft.contact.links.length}
					</span>
				</button>
			</div>

			<!-- Feedback -->
			{#if saveError}
				<div
					role="alert"
					class="mb-5 border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
				>
					{saveError}
				</div>
			{:else if saveSuccess}
				<div
					role="status"
					class="border-mint/30 bg-mint/5 text-mint mb-5 flex items-center gap-2 border px-4 py-3 text-sm"
				>
					<CircleCheck class="size-4" />
					Profile saved successfully.
				</div>
			{/if}

			<!-- HERO -->
			{#if activeSection === 'hero'}
				<section class="space-y-5">
					<div class="border border-border bg-card p-5 @sm/profile:p-6">
						<div class="mb-6">
							<p class="font-mono text-[10px] tracking-[0.16em] text-gold">01 / INTRODUCTION</p>

							<h2 class="mt-2 text-xl font-semibold tracking-tight text-foreground">
								Hero section
							</h2>

							<p class="mt-1 text-sm text-muted-foreground">
								The first information visitors see on your portfolio.
							</p>
						</div>

						<div class="grid grid-cols-1 gap-5 @2xl/profile:grid-cols-2">
							<div class="space-y-2">
								<label for="hero-name" class="text-xs font-medium text-muted-foreground">
									Name
								</label>

								<input
									id="hero-name"
									bind:value={draft.hero.name}
									oninput={clearFeedback}
									placeholder="Your name"
									class="h-10 w-full border border-input bg-background px-3 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground hover:border-foreground/25 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
								/>
							</div>

							<div class="space-y-2">
								<label for="hero-headline" class="text-xs font-medium text-muted-foreground">
									Headline
								</label>

								<input
									id="hero-headline"
									bind:value={draft.hero.headline}
									oninput={clearFeedback}
									placeholder="Full-stack developer..."
									class="h-10 w-full border border-input bg-background px-3 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground hover:border-foreground/25 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
								/>
							</div>

							<div class="space-y-2 @2xl/profile:col-span-2">
								<label for="hero-description" class="text-xs font-medium text-muted-foreground">
									Description
								</label>

								<textarea
									id="hero-description"
									bind:value={draft.hero.description}
									oninput={clearFeedback}
									rows={4}
									placeholder="A short introduction about yourself..."
									class="w-full resize-y border border-input bg-background px-3 py-3 text-sm leading-relaxed text-foreground transition-colors outline-none placeholder:text-muted-foreground hover:border-foreground/25 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
								></textarea>
							</div>
						</div>
					</div>

					<!-- Hero Lines -->
					<div class="border border-border bg-card p-5 @sm/profile:p-6">
						<div class="mb-5 flex items-center justify-between gap-4">
							<div>
								<h3 class="text-base font-semibold text-foreground">Headline lines</h3>

								<p class="mt-1 text-xs text-muted-foreground">
									Manage the individual lines displayed in your hero.
								</p>
							</div>

							<button
								type="button"
								onclick={addHeroLine}
								class="inline-flex h-9 shrink-0 items-center gap-1.5 border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
							>
								<Plus class="size-3.5" />
								Add line
							</button>
						</div>

						<div class="space-y-2">
							{#each draft.hero.lines as line, i (i)}
								<div class="flex items-center gap-2">
									<span class="w-6 shrink-0 font-mono text-[10px] text-muted-foreground">
										{String(i + 1).padStart(2, '0')}
									</span>

									<input
										value={line}
										oninput={(event) => updateHeroLine(i, event.currentTarget.value)}
										aria-label="Hero line {i + 1}"
										placeholder="Enter a line..."
										class="h-10 min-w-0 flex-1 border border-input bg-background px-3 text-sm text-foreground outline-none"
									/>

									<button
										type="button"
										onclick={() => removeHeroLine(i)}
										aria-label="Remove line"
										class="flex size-9 shrink-0 items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
									>
										<Trash2 class="size-4" />
									</button>
								</div>
							{:else}
								<p
									class="border border-dashed border-border py-8 text-center text-sm text-muted-foreground"
								>
									No lines yet.
								</p>
							{/each}
						</div>
					</div>
				</section>

				<!-- ABOUT -->
			{:else if activeSection === 'about'}
				<section class="space-y-5">
					<div
						class="flex flex-col gap-3 @sm/profile:flex-row @sm/profile:items-center @sm/profile:justify-between"
					>
						<div>
							<p class="font-mono text-[10px] tracking-[0.16em] text-gold">
								02 / PERSONAL INFORMATION
							</p>

							<h2 class="mt-2 text-xl font-semibold tracking-tight text-foreground">About tabs</h2>

							<p class="mt-1 text-sm text-muted-foreground">
								Manage the tabs and their content in your about section.
							</p>
						</div>

						<button
							type="button"
							onclick={addAboutTab}
							class="inline-flex h-10 shrink-0 items-center justify-center gap-2 bg-primary px-4 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
						>
							<Plus class="size-4" />
							Add tab
						</button>
					</div>

					{#each draft.about.tabs as tab, i (tab.id)}
						<article class="border border-border bg-card p-5 @sm/profile:p-6">
							<div class="mb-5 flex items-center justify-between gap-3 border-b border-border pb-4">
								<div class="flex min-w-0 items-center gap-3">
									<span
										class="flex size-8 shrink-0 items-center justify-center bg-gold/10 font-mono text-xs text-gold"
									>
										{String(i + 1).padStart(2, '0')}
									</span>

									<div class="min-w-0">
										<h3 class="truncate text-sm font-semibold text-foreground">
											{tab.title || 'Untitled tab'}
										</h3>

										<p class="mt-0.5 font-mono text-[10px] text-muted-foreground">
											{tab.pill || 'NO PILL'}
										</p>
									</div>
								</div>

								<button
									type="button"
									onclick={() => removeAboutTab(tab.id)}
									class="inline-flex h-8 shrink-0 items-center gap-1.5 px-2 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
								>
									<Trash2 class="size-3.5" />
									Remove
								</button>
							</div>

							<div class="grid grid-cols-1 gap-5 @2xl/profile:grid-cols-2">
								<div class="space-y-2">
									<label for="tab-title-{tab.id}" class="text-xs font-medium text-muted-foreground">
										Title
									</label>

									<input
										id="tab-title-{tab.id}"
										bind:value={tab.title}
										oninput={clearFeedback}
										placeholder="About me"
										class="h-10 w-full border border-input bg-background px-3 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground hover:border-foreground/25 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
									/>
								</div>

								<div class="space-y-2">
									<label for="tab-pill-{tab.id}" class="text-xs font-medium text-muted-foreground">
										Pill
									</label>

									<input
										id="tab-pill-{tab.id}"
										bind:value={tab.pill}
										oninput={clearFeedback}
										placeholder="INTRODUCTION"
										class="h-10 w-full border border-input bg-background px-3 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground hover:border-foreground/25 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
									/>
								</div>

								<div class="space-y-2 @2xl/profile:col-span-2">
									<label for="tab-text-{tab.id}" class="text-xs font-medium text-muted-foreground">
										Text
									</label>

									<textarea
										id="tab-text-{tab.id}"
										bind:value={tab.text}
										oninput={clearFeedback}
										rows={4}
										placeholder="Write the content of this tab..."
										class="w-full resize-y border border-input bg-background px-3 py-3 text-sm leading-relaxed text-foreground transition-colors outline-none placeholder:text-muted-foreground hover:border-foreground/25 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
									></textarea>
								</div>
							</div>

							<!-- Tab Lines -->
							<div class="mt-6 border-t border-border pt-5">
								<div class="mb-4 flex items-center justify-between gap-3">
									<h4 class="text-xs font-semibold text-foreground">
										Lines

										<span class="ml-1 font-mono text-muted-foreground">
											({tab.lines.length})
										</span>
									</h4>

									<button
										type="button"
										onclick={() => addAboutLine(tab)}
										class="inline-flex items-center gap-1 text-xs font-medium text-primary transition-opacity hover:opacity-70"
									>
										<Plus class="size-3.5" />
										Add line
									</button>
								</div>

								<div class="space-y-2">
									{#each tab.lines as line, j (j)}
										<div class="flex items-center gap-2">
											<span class="w-6 shrink-0 font-mono text-[10px] text-muted-foreground">
												{String(j + 1).padStart(2, '0')}
											</span>

											<input
												value={line}
												oninput={(event) => updateAboutLine(tab, j, event.currentTarget.value)}
												aria-label="About line {j + 1}"
												placeholder="Enter a line..."
												class="h-9 min-w-0 flex-1 border border-input bg-background px-3 text-xs text-foreground outline-none"
											/>

											<button
												type="button"
												onclick={() => removeAboutLine(tab, j)}
												aria-label="Remove line"
												class="flex size-9 shrink-0 items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
											>
												<Trash2 class="size-3.5" />
											</button>
										</div>
									{:else}
										<p class="py-4 text-center text-xs text-muted-foreground">
											No lines in this tab.
										</p>
									{/each}
								</div>
							</div>
						</article>
					{:else}
						<div
							class="flex min-h-64 flex-col items-center justify-center border border-dashed border-border px-6 text-center"
						>
							<span class="mb-4 flex size-14 items-center justify-center bg-gold/10 text-gold">
								<PanelsTopLeft class="size-7" strokeWidth={1.4} />
							</span>

							<h3 class="text-base font-medium text-foreground">No about tabs</h3>

							<p class="mt-2 text-sm text-muted-foreground">
								Add your first tab to start building your about section.
							</p>
						</div>
					{/each}
				</section>

				<!-- CONTACT -->
			{:else if activeSection === 'contact'}
				<section class="space-y-5">
					<div
						class="flex flex-col gap-3 @sm/profile:flex-row @sm/profile:items-center @sm/profile:justify-between"
					>
						<div>
							<p class="font-mono text-[10px] tracking-[0.16em] text-blue">03 / GET IN TOUCH</p>

							<h2 class="mt-2 text-xl font-semibold tracking-tight text-foreground">
								Contact links
							</h2>

							<p class="mt-1 text-sm text-muted-foreground">
								Manage the links visitors can use to reach you.
							</p>
						</div>

						<button
							type="button"
							onclick={addContactLink}
							class="inline-flex h-10 shrink-0 items-center justify-center gap-2 bg-primary px-4 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
						>
							<Plus class="size-4" />
							Add link
						</button>
					</div>

					<div class="border border-border bg-card p-5 @sm/profile:p-6">
						<div class="mb-5 flex items-center justify-between border-b border-border pb-4">
							<div>
								<h3 class="text-sm font-semibold text-foreground">Your links</h3>

								<p class="mt-1 text-xs text-muted-foreground">
									{draft.contact.links.length} links configured
								</p>
							</div>

							<Link2 class="size-5 text-blue" />
						</div>

						<div class="space-y-3">
							{#each draft.contact.links as link (link.id)}
								<div
									class="grid grid-cols-1 gap-3 border border-border bg-background p-4 @xl/profile:grid-cols-[1fr_2fr_2fr_auto] @xl/profile:items-end"
								>
									<div class="space-y-2">
										<label
											for="contact-label-{link.id}"
											class="text-xs font-medium text-muted-foreground"
										>
											Label
										</label>

										<input
											id="contact-label-{link.id}"
											bind:value={link.label}
											oninput={clearFeedback}
											placeholder="GitHub"
											class="h-10 w-full border border-input bg-card px-3 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground hover:border-foreground/25 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
										/>
									</div>

									<div class="space-y-2">
										<label
											for="contact-href-{link.id}"
											class="text-xs font-medium text-muted-foreground"
										>
											URL
										</label>

										<input
											id="contact-href-{link.id}"
											bind:value={link.href}
											oninput={clearFeedback}
											placeholder="https://github.com/username"
											class="h-10 w-full border border-input bg-card px-3 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground hover:border-foreground/25 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
										/>
									</div>
									<div class="space-y-2">
										<label
											for="contact-hint-{link.id}"
											class="text-xs font-medium text-muted-foreground"
										>
											Hint
										</label>

										<input
											id="contact-hint-{link.id}"
											bind:value={link.hint}
											oninput={clearFeedback}
											placeholder="Usually replies within 24 hours"
											class="h-10 w-full border border-input bg-card px-3 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground hover:border-foreground/25 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
										/>
									</div>

									<button
										type="button"
										onclick={() => removeContactLink(link.id)}
										aria-label="Remove contact link"
										class="flex h-10 items-center justify-center gap-2 border border-border px-3 text-xs text-muted-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
									>
										<Trash2 class="size-3.5" />
										<span class="@xl/profile:hidden">Remove</span>
									</button>
								</div>
							{:else}
								<p class="py-12 text-center text-sm text-muted-foreground">
									No contact links configured.
								</p>
							{/each}
						</div>
					</div>
				</section>
			{/if}

			<!-- Footer -->
			<footer
				class="mt-8 flex flex-col gap-3 border-t border-border py-6 @sm/profile:flex-row @sm/profile:items-center @sm/profile:justify-between"
			>
				<div class="flex items-center gap-2 text-xs text-muted-foreground">
					{#if isDirty}
						<CircleDot class="size-3.5 text-gold" />
						You have unsaved changes.
					{:else}
						<CircleCheck class="text-mint size-3.5" />
						All changes saved.
					{/if}
				</div>

				<button
					type="button"
					onclick={saveProfile}
					disabled={!isDirty || saveMutation.isPending}
					class="inline-flex h-10 items-center justify-center gap-2 border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
				>
					<Save class="size-4" />
					{saveMutation.isPending ? 'Saving...' : 'Save changes'}
				</button>
			</footer>
		{:else}
			<div
				class="flex min-h-64 flex-col items-center justify-center border border-dashed border-border text-center"
			>
				<p class="text-sm text-destructive">Profile data is missing or invalid.</p>

				<button
					type="button"
					onclick={() => profileQuery.refetch()}
					class="mt-3 border border-border px-4 py-2 text-sm hover:bg-accent"
				>
					Try again
				</button>
			</div>
		{/if}
	</main>
</div>
