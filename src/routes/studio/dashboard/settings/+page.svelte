<script lang="ts">
	import {
		ArrowUpRight,
		CalendarDays,
		KeyRound,
		LoaderCircle,
		UserRound,
		Palette
	} from '@lucide/svelte';

	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { authClient } from '#lib/auth-client.ts';

	import SettingsField from './_components/settings-field.svelte';
	import TextField from '#lib/components/shared/TextField.svelte';
	import ThemeSwitcher from '#lib/components/shared/ThemeSwitcher.svelte';

	const session = authClient.useSession();
	const user = $derived($session.data?.user);

	const today = new Date().toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	});

	const initials = $derived(
		(user?.name ?? '')
			.split(' ')
			.filter(Boolean)
			.map((word) => word[0])
			.join('')
			.slice(0, 2)
			.toUpperCase() || '?'
	);

	// Profile
	let profileOpen = $state(false);
	let name = $state('');
	let profileLoading = $state(false);
	let profileError = $state('');
	let profileSuccess = $state(false);

	function openProfile() {
		name = user?.name ?? '';
		profileError = '';
		profileLoading = false;
		profileOpen = true;
	}

	async function saveProfile(event: SubmitEvent) {
		event.preventDefault();
		profileError = '';

		const trimmedName = name.trim();

		if (trimmedName.length < 2) {
			profileError = 'Name must be at least 2 characters.';
			return;
		}

		if (trimmedName === user?.name) {
			profileOpen = false;
			return;
		}

		profileLoading = true;

		try {
			const { error } = await authClient.updateUser({
				name: trimmedName
			});

			if (error) {
				profileError = error.message ?? 'Something went wrong.';
				return;
			}

			profileOpen = false;
			profileSuccess = true;

			setTimeout(() => {
				profileSuccess = false;
			}, 4000);
		} catch (error) {
			profileError = error instanceof Error ? error.message : 'Something went wrong.';
		} finally {
			profileLoading = false;
		}
	}

	// Password
	let passwordOpen = $state(false);
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let revokeOthers = $state(true);
	let passwordLoading = $state(false);
	let passwordError = $state('');
	let passwordSuccess = $state(false);

	function resetPassword() {
		currentPassword = '';
		newPassword = '';
		confirmPassword = '';
		revokeOthers = true;
		passwordError = '';
		passwordLoading = false;
	}

	async function savePassword(event: SubmitEvent) {
		event.preventDefault();
		passwordError = '';

		if (newPassword.length < 3) {
			passwordError = 'Password must be at least 3 characters.';
			return;
		}

		if (newPassword !== confirmPassword) {
			passwordError = 'Passwords do not match.';
			return;
		}

		if (newPassword === currentPassword) {
			passwordError = 'New password must be different from the current one.';
			return;
		}

		passwordLoading = true;

		try {
			const { error } = await authClient.changePassword({
				currentPassword,
				newPassword,
				revokeOtherSessions: revokeOthers
			});

			if (error) {
				passwordError = error.message ?? 'Something went wrong.';
				return;
			}

			passwordOpen = false;
			passwordSuccess = true;

			setTimeout(() => {
				passwordSuccess = false;
			}, 4000);
		} catch (error) {
			passwordError = error instanceof Error ? error.message : 'Something went wrong.';
		} finally {
			passwordLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Settings — Devfolio</title>
	<meta name="description" content="Manage your Devfolio account, security, and appearance." />
</svelte:head>

<div class="@container/settings mx-auto w-full max-w-300 min-w-0">
	<main class="min-h-dvh w-full min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
		<!-- Header -->
		<header class="mb-6 sm:mb-8">
			<p
				class="mb-3 flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-muted-foreground sm:mb-4"
			>
				<CalendarDays class="size-3.5 shrink-0 text-gold" />
				{today.toUpperCase()}
			</p>

			<h1
				class="text-3xl font-semibold tracking-[-0.055em] text-foreground sm:text-4xl lg:text-5xl"
			>
				Settings<span class="text-primary">.</span>
			</h1>

			<p class="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:mt-3 sm:text-base">
				Manage your account, security, and studio appearance.
			</p>
		</header>

		<div class="min-w-0 space-y-4 sm:space-y-5">
			<!-- Profile -->
			<section class="min-w-0 border border-border bg-card p-4 sm:p-5 lg:p-7">
				<div class="flex items-center justify-between gap-3 sm:gap-4">
					<div class="min-w-0">
						<p class="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
							ACCOUNT / 01
						</p>

						<h2 class="mt-2 text-lg font-semibold tracking-tight text-foreground">Profile</h2>
					</div>

					<span
						class="flex size-9 shrink-0 items-center justify-center bg-primary/10 text-primary sm:size-10"
					>
						<UserRound class="size-5" strokeWidth={1.7} />
					</span>
				</div>

				<div
					class="mt-5 flex min-w-0 flex-col gap-4 border-t border-border pt-5 sm:mt-6 sm:flex-row sm:items-center sm:gap-5"
				>
					<div
						class="flex size-12 shrink-0 items-center justify-center bg-background font-mono text-sm font-semibold text-foreground sm:size-14"
					>
						{initials}
					</div>

					<div class="min-w-0 flex-1">
						<h3 class="truncate text-sm font-semibold text-foreground sm:text-base">
							{user?.name ?? '—'}
						</h3>

						<p class="mt-1 text-xs break-all text-muted-foreground sm:truncate sm:text-sm">
							{user?.email ?? ''}
						</p>

						{#if profileSuccess}
							<p role="status" class="mt-2 text-xs text-primary">Profile updated successfully.</p>
						{/if}
					</div>

					<button
						type="button"
						onclick={openProfile}
						disabled={!user}
						class="inline-flex min-h-10 w-full shrink-0 items-center justify-center gap-1.5 border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary disabled:opacity-50 sm:w-auto"
					>
						Edit profile
						<ArrowUpRight class="size-4" />
					</button>
				</div>
			</section>

			<!-- Security -->
			<section class="min-w-0 border border-border bg-card p-4 sm:p-5 lg:p-7">
				<div class="flex items-center justify-between gap-3 sm:gap-4">
					<div class="min-w-0">
						<p class="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
							SECURITY / 02
						</p>

						<h2 class="mt-2 text-lg font-semibold tracking-tight text-foreground">Security</h2>
					</div>

					<span
						class="flex size-9 shrink-0 items-center justify-center bg-blue/10 text-blue sm:size-10"
					>
						<KeyRound class="size-5" strokeWidth={1.7} />
					</span>
				</div>

				<div
					class="mt-5 flex min-w-0 flex-col gap-4 border-t border-border pt-5 sm:mt-6 sm:flex-row sm:items-center sm:gap-5"
				>
					<div
						class="flex size-12 shrink-0 items-center justify-center bg-background text-foreground sm:size-14"
					>
						<KeyRound class="size-5" strokeWidth={1.7} />
					</div>

					<div class="min-w-0 flex-1">
						<h3 class="text-sm font-semibold text-foreground sm:text-base">Password</h3>

						<p class="mt-1 text-sm leading-relaxed text-muted-foreground">
							Update your password to keep your account secure.
						</p>

						{#if passwordSuccess}
							<p role="status" class="mt-2 text-xs text-primary">Password updated successfully.</p>
						{/if}
					</div>

					<button
						type="button"
						onclick={() => (passwordOpen = true)}
						class="inline-flex min-h-10 w-full shrink-0 items-center justify-center gap-1.5 border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary sm:w-auto"
					>
						Change password
						<ArrowUpRight class="size-4" />
					</button>
				</div>
			</section>

			<!-- Appearance -->
			<section class="min-w-0 border border-border bg-card p-4 sm:p-5 lg:p-7">
				<div class="flex items-start justify-between gap-3 sm:gap-4">
					<div class="min-w-0 flex-1">
						<p class="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
							PREFERENCES / 03
						</p>

						<h2 class="mt-2 text-lg font-semibold tracking-tight text-foreground">Appearance</h2>

						<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
							Choose the theme that suits your workspace.
						</p>
					</div>

					<span
						class="flex size-9 shrink-0 items-center justify-center bg-gold/10 text-gold sm:size-10"
					>
						<Palette class="size-5" strokeWidth={1.7} />
					</span>
				</div>

				<div class="mt-5 min-w-0 border-t border-border pt-5 sm:mt-6">
					<ThemeSwitcher />
				</div>
			</section>
		</div>
	</main>
</div>

<!-- Edit profile dialog -->
<Dialog.Root bind:open={profileOpen}>
	<Dialog.Content
		class="max-h-[90dvh] w-[calc(100vw-2rem)] max-w-md overflow-y-auto rounded-none border-border bg-card p-0"
	>
		<div class="border-b border-border px-4 py-4 pr-12 sm:px-6 sm:py-5">
			<p class="mb-2 font-mono text-[10px] tracking-[0.16em] text-muted-foreground">ACCOUNT</p>

			<Dialog.Title class="text-lg font-semibold tracking-tight text-foreground">
				Edit profile
			</Dialog.Title>

			<Dialog.Description class="mt-1 text-sm leading-relaxed text-muted-foreground">
				Update the name displayed across your studio.
			</Dialog.Description>
		</div>

		<form onsubmit={saveProfile}>
			<div class="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
				<div
					class="flex min-w-0 items-center gap-3 border border-border bg-background p-3 sm:gap-4 sm:p-4"
				>
					<div
						class="flex size-10 shrink-0 items-center justify-center bg-card font-mono text-sm font-semibold text-foreground sm:size-12"
					>
						{initials}
					</div>

					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-semibold text-foreground">
							{name || user?.name || 'Your name'}
						</p>

						<p class="mt-1 text-xs break-all text-muted-foreground sm:truncate">
							{user?.email ?? ''}
						</p>
					</div>
				</div>

				<SettingsField id="name" label="Display name" hint="At least 2 characters.">
					<TextField
						id="name"
						autocomplete="name"
						placeholder="Your name"
						bind:value={name}
						required
					/>
				</SettingsField>

				{#if profileError}
					<p
						role="alert"
						class="border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm break-words text-destructive"
					>
						{profileError}
					</p>
				{/if}
			</div>

			<div
				class="flex flex-col-reverse gap-2 border-t border-border bg-sidebar/30 p-4 sm:flex-row sm:justify-end sm:px-6"
			>
				<Button
					type="button"
					variant="outline"
					class="w-full rounded-none sm:w-auto"
					disabled={profileLoading}
					onclick={() => (profileOpen = false)}
				>
					Cancel
				</Button>

				<Button
					type="submit"
					class="w-full rounded-none sm:w-auto"
					disabled={profileLoading || !name.trim()}
				>
					{#if profileLoading}
						<LoaderCircle class="size-4 animate-spin" />
						Saving...
					{:else}
						Save changes
					{/if}
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Change password dialog -->
<Dialog.Root
	bind:open={passwordOpen}
	onOpenChange={(value) => {
		if (!value) resetPassword();
	}}
>
	<Dialog.Content
		class="max-h-[90dvh] w-[calc(100vw-2rem)] max-w-md overflow-y-auto rounded-none border-border bg-card p-0"
	>
		<div class="border-b border-border px-4 py-4 pr-12 sm:px-6 sm:py-5">
			<p class="mb-2 font-mono text-[10px] tracking-[0.16em] text-muted-foreground">SECURITY</p>

			<Dialog.Title class="text-lg font-semibold tracking-tight text-foreground">
				Change password
			</Dialog.Title>

			<Dialog.Description class="mt-1 text-sm leading-relaxed text-muted-foreground">
				Choose a strong password with at least 8 characters.
			</Dialog.Description>
		</div>

		<form onsubmit={savePassword}>
			<div class="space-y-4 px-4 py-5 sm:space-y-5 sm:px-6 sm:py-6">
				<SettingsField id="current" label="Current password">
					<TextField
						id="current"
						type="password"
						autocomplete="current-password"
						placeholder="Enter current password"
						bind:value={currentPassword}
						required
					/>
				</SettingsField>

				<SettingsField id="new" label="New password" hint="At least 8 characters.">
					<TextField
						id="new"
						type="password"
						autocomplete="new-password"
						placeholder="Enter new password"
						bind:value={newPassword}
						required
					/>
				</SettingsField>

				<SettingsField id="confirm" label="Confirm new password">
					<TextField
						id="confirm"
						type="password"
						autocomplete="new-password"
						placeholder="Repeat new password"
						bind:value={confirmPassword}
						required
					/>
				</SettingsField>

				<label
					class="flex min-w-0 cursor-pointer items-start gap-3 border border-border bg-background p-3"
				>
					<input
						type="checkbox"
						bind:checked={revokeOthers}
						class="mt-0.5 shrink-0 accent-primary"
					/>

					<span class="min-w-0 text-sm">
						<span class="block font-medium text-foreground"> Sign out other devices </span>

						<span class="mt-1 block text-xs leading-relaxed text-muted-foreground">
							Recommended if you think someone else has access to your account.
						</span>
					</span>
				</label>

				{#if passwordError}
					<p
						role="alert"
						class="border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm break-words text-destructive"
					>
						{passwordError}
					</p>
				{/if}
			</div>

			<div
				class="flex flex-col-reverse gap-2 border-t border-border bg-sidebar/30 p-4 sm:flex-row sm:justify-end sm:px-6"
			>
				<Button
					type="button"
					variant="outline"
					class="w-full rounded-none sm:w-auto"
					disabled={passwordLoading}
					onclick={() => (passwordOpen = false)}
				>
					Cancel
				</Button>

				<Button type="submit" class="w-full rounded-none sm:w-auto" disabled={passwordLoading}>
					{#if passwordLoading}
						<LoaderCircle class="size-4 animate-spin" />
						Updating...
					{:else}
						Update password
					{/if}
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
