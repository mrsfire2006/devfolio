<script lang="ts">
	import { authClient } from '#lib/auth-client.ts';
	import AlertMessage from '#lib/components/shared/AlertMessage.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let loading = $state(false);

	let messageType = $state<'error' | 'success' | 'none'>('none');
	let message = $state('');
	async function handleLogin() {
		loading = true;
		messageType = 'none';
		message = '';

		try {
			const result = await authClient.signIn.email({ email, password });

			if (result.error) {
				messageType = 'error';
				message = result.error.message ?? 'error';
				return;
			}
			
			await goto(resolve("/studio/dashboard/projects"))
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>devfolio — Studio</title>
	<meta name="description" content="Private studio dashboard for devfolio." />
</svelte:head>

<div class="relative min-h-screen overflow-hidden bg-background text-foreground">
	<!-- Soft background -->
	<div class="pointer-events-none absolute inset-0 overflow-hidden">
		<div
			class="absolute top-45 left-1/2 h-105 w-105 -translate-x-1/2 rounded-full bg-primary/4.5 blur-3xl"
		></div>

		<div
			class="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-primary/[0.035] blur-3xl"
		></div>

		<div class="absolute top-1/3 -right-20 h-64 w-64 rounded-full bg-secondary/70 blur-3xl"></div>

		<!-- subtle grid -->
		<div
			class="absolute inset-0 opacity-[0.18]"
			style="
				background-image:
					linear-gradient(to right, currentColor 1px, transparent 1px),
					linear-gradient(to bottom, currentColor 1px, transparent 1px);
				background-size: 48px 48px;
				mask-image: linear-gradient(to bottom, black, transparent 70%);
			"
		></div>
	</div>

	<!-- Header -->
	<header class="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10 lg:px-12">
		<a href="/" class="group flex items-center gap-3">
			<div
				class="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground font-mono text-xs font-bold text-background shadow-sm transition-transform duration-200 group-hover:-rotate-3"
			>
				&lt;/&gt;
			</div>

			<div class="leading-none">
				<div class="text-[15px] font-semibold tracking-tight">devfolio</div>
				<div class="mt-1 font-mono text-[9px] tracking-[0.18em] text-muted-foreground uppercase">
					studio
				</div>
			</div>
		</a>

		<div
			class="rounded-full border border-border/80 bg-card/70 px-3 py-1.5 font-mono text-[9px] tracking-[0.18em] text-muted-foreground uppercase backdrop-blur-sm"
		>
			private
		</div>
	</header>

	<!-- Main -->
	<main
		class="relative z-10 flex min-h-[calc(100vh-88px)] items-center justify-center px-5 pt-4 pb-16"
	>
		<div class="w-full max-w-107.5">
			<!-- Login card -->
			<div
				class="rounded-[22px] border border-border/80 bg-card/90 p-7 shadow-xl backdrop-blur-md sm:p-9"
			>
				<!-- Top -->
				<div class="mb-8 flex items-start justify-between">
					<div
						class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-sm"
					>
						<span class="font-mono">&lt;/&gt;</span>
					</div>

					<div
						class="flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5"
					>
						<span class="h-1.5 w-1.5 rounded-full bg-primary"></span>
						<span class="font-mono text-[9px] tracking-[0.15em] text-muted-foreground uppercase">
							owner
						</span>
					</div>
				</div>

				<!-- Heading -->
				<div class="mb-8">
					<p class="mb-2 font-mono text-[10px] tracking-[0.18em] text-primary uppercase">
						Welcome back
					</p>

					<h1 class="font-serif text-[2.65rem] leading-[1.02] font-semibold tracking-[-0.04em]">
						Sign in to
						<span class="text-primary">devfolio.</span>
					</h1>

					<p class="mt-4 max-w-sm text-[13px] leading-6 text-muted-foreground">
						Your private space for managing projects, skills, and the portfolio.
					</p>
				</div>

				<form
					onsubmit={(event) => {
						event.preventDefault();
						handleLogin();
					}}
					class="space-y-5"
				>
					<!-- Email -->
					<div>
						<label for="email" class="mb-2.5 block text-xs font-medium"> Email address </label>

						<div class="relative">
							<div
								class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground"
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.7"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<rect width="20" height="16" x="2" y="4" rx="2"></rect>
									<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
								</svg>
							</div>

							<input
								id="email"
								name="email"
								type="email"
								autocomplete="email"
								bind:value={email}
								placeholder="you@example.com"
								required
								class="h-12 w-full rounded-xl border border-input bg-background pr-4 pl-11 text-sm transition-all outline-none placeholder:text-muted-foreground/45 hover:border-foreground/20 focus:border-primary focus:ring-4 focus:ring-primary/10"
							/>
						</div>
					</div>

					<!-- Password -->
					<div>
						<div class="mb-2.5 flex items-center justify-between">
							<label for="password" class="text-xs font-medium"> Password </label>

							<button
								type="button"
								onclick={() => (showPassword = !showPassword)}
								class="font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
							>
								{showPassword ? 'hide' : 'show'}
							</button>
						</div>

						<div class="relative">
							<div
								class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground"
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.7"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<rect width="18" height="11" x="3" y="11" rx="2"></rect>
									<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
								</svg>
							</div>

							<input
								id="password"
								name="password"
								type={showPassword ? 'text' : 'password'}
								autocomplete="current-password"
								bind:value={password}
								placeholder="Enter your password"
								required
								class="h-12 w-full rounded-xl border border-input bg-background pr-16 pl-11 text-sm transition-all outline-none placeholder:text-muted-foreground/45 hover:border-foreground/20 focus:border-primary focus:ring-4 focus:ring-primary/10"
							/>
						</div>
					</div>

					<AlertMessage type={messageType} {message} />
					<!-- Submit -->
					<button
						type="submit"
						disabled={loading}
						class="group mt-2 flex h-12 w-full items-center justify-between rounded-xl bg-foreground px-4.5 text-sm font-medium text-background shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:pointer-events-none disabled:opacity-60"
					>
						<span>{loading ? 'Signing in...' : 'Continue to studio'}</span>

						<span
							class="flex h-7 w-7 items-center justify-center rounded-lg bg-background/10 font-mono text-sm transition-transform duration-200 group-hover:translate-x-0.5"
						>
							→
						</span>
					</button>
				</form>

				<!-- Bottom -->
				<div class="mt-8 border-t border-border pt-5">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2 text-muted-foreground">
							<svg
								width="13"
								height="13"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.8"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<rect width="18" height="11" x="3" y="11" rx="2"></rect>
								<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
							</svg>

							<span class="text-[10px]">Private workspace</span>
						</div>

						<span class="font-mono text-[10px] text-muted-foreground"> 01 / 01 </span>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div class="mt-5 flex items-center justify-center gap-2 text-muted-foreground">
				<span class="font-mono text-[10px]">&lt;/&gt;</span>
				<span class="text-[10px]">devfolio studio</span>
				<span class="text-[10px]">·</span>
				<span class="text-[10px]">private access</span>
			</div>
		</div>
	</main>
</div>

<style>
	:global(input:-webkit-autofill),
	:global(input:-webkit-autofill:hover),
	:global(input:-webkit-autofill:focus),
	:global(input:-webkit-autofill:active) {
		-webkit-box-shadow: 0 0 0 1000px #211d19 inset !important;
		-webkit-text-fill-color: #eee5da !important;
		caret-color: #eee5da !important;
		transition: background-color 9999s ease-in-out 0s;
	}
	:global(input:-moz-autofill) {
		background-color: #211d19 !important;
		color: #eee5da !important;
	}
</style>
