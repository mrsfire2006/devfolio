<script lang="ts">
	import {
		BadgeCheck,
		Bell,
		Check,
		ChevronDown,
		ChevronRight,
		ExternalLink,
		LayoutDashboard,
		Layers,
		Search,
		SlidersVertical,

		User

	} from '@lucide/svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';

	type Tone = 'primary' | 'blue' | 'violet' | 'gold';

	const tones: Record<Tone, { tile: string; active: string }> = {
		primary: { tile: 'bg-primary/15 text-primary', active: 'bg-primary text-primary-foreground' },
		blue: { tile: 'bg-blue/15 text-blue', active: 'bg-blue text-background' },
		violet: { tile: 'bg-violet/15 text-violet', active: 'bg-violet text-background' },
		gold: {
			tile: 'bg-gold/15 text-gold',
			active: 'bg-gold text-background'
		}
	};

	const pages: { label: string; href: string; icon: typeof Layers; tone: Tone }[] = [
		{
			label: 'Projects',
			href: resolve('/studio/dashboard/projects'),
			icon: Layers,
			tone: 'primary'
		},
		{ label: 'Skills', href: resolve('/studio/dashboard/skills'), icon: BadgeCheck, tone: 'blue' },
		{
			label: 'Settings',
			href: resolve('/studio/dashboard/settings'),
			icon: SlidersVertical,
			tone: 'violet'
		},
		{
			label: 'Profile',
			href: resolve('/studio/dashboard/profile'),
			icon: User,
			tone: 'gold'
		}
	];

	const current = $derived(pages.find((p) => page.url.pathname.startsWith(p.href)));

	const iconBtn =
		'flex size-9 items-center justify-center rounded-none text-muted-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring';
</script>

<header
	class="sticky top-0 z-40 flex h-16 shrink-0 items-center border-b border-border/60 bg-background/60 px-4 backdrop-blur-md lg:px-6"
>
	<!-- glow خفيف بلون الـ theme -->
	<div
		class="pointer-events-none absolute inset-0 -z-10"
		style="background: radial-gradient(ellipse 50% 120% at 20% 0, color-mix(in oklab, var(--primary) 8%, transparent), transparent)"
	></div>

	<!-- ═════════ Left ═════════ -->
	<div class="flex min-w-0 flex-1 items-center gap-3">
		<Sidebar.Trigger
			class="size-9 rounded-none bg-muted/60 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
		/>

		<div class="hidden h-5 w-px bg-border/60 sm:block"></div>

		<nav class="flex min-w-0 items-center gap-2" aria-label="Breadcrumb">
			<span class="hidden items-center gap-1.5 text-sm font-semibold text-muted-foreground sm:flex">
				<LayoutDashboard class="size-4 text-gold" />
				Dashboard
			</span>
			<ChevronRight class="hidden size-3.5 text-muted-foreground/40 sm:block" />

			<!-- Page switcher -->
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					class="group flex cursor-pointer items-center gap-2 rounded-none bg-sidebar-accent py-1 pr-2.5 pl-1 text-sm font-semibold text-sidebar-foreground ring-1 ring-sidebar-border transition-colors outline-none hover:bg-sidebar-accent/80 focus-visible:ring-2 focus-visible:ring-sidebar-ring"
					aria-current="page"
				>
					<span
						class="flex size-7 items-center justify-center {current
							? tones[current.tone].active
							: 'bg-muted text-muted-foreground'}"
					>
						{#if current}
							<current.icon class="size-4" strokeWidth={2.1} />
						{:else}
							<LayoutDashboard class="size-4" />
						{/if}
					</span>

					<span>{current?.label ?? 'Dashboard'}</span>

					<ChevronDown
						class="size-3.5 text-sidebar-foreground/50 transition-transform duration-200 group-data-[state=open]:rotate-180"
					/>
				</DropdownMenu.Trigger>

				<DropdownMenu.Content
					align="start"
					sideOffset={8}
					class="min-w-56 rounded-none border border-sidebar-border bg-sidebar p-1 shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
				>
					<DropdownMenu.Label
						class="px-2.5 py-2 text-[10px] font-semibold tracking-[0.18em] text-sidebar-foreground/50 uppercase"
					>
						Studio
					</DropdownMenu.Label>

					{#each pages as p (p.href)}
						{@const active = current?.href === p.href}

						<DropdownMenu.Item
							onSelect={() => goto(p.href)}
							class="group/item flex cursor-pointer items-center gap-3 rounded-none px-2.5 py-2 text-sm font-medium text-sidebar-foreground/80 outline-none data-highlighted:bg-sidebar-accent data-highlighted:text-sidebar-foreground {active
								? 'bg-sidebar-accent text-sidebar-foreground'
								: ''}"
						>
							<span
								class="flex size-8 shrink-0 items-center justify-center transition-transform group-hover/item:scale-105 {active
									? tones[p.tone].active
									: tones[p.tone].tile}"
							>
								<p.icon class="size-4" strokeWidth={active ? 2.2 : 1.8} />
							</span>

							<span class="flex-1">{p.label}</span>

							{#if active}
								<Check class="size-4 text-sidebar-primary" strokeWidth={2.5} />
							{/if}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</nav>
	</div>

	<!-- ═════════ Right ═════════ -->
	<div class="flex items-center gap-1">
		<!-- Search (desktop) -->
		<button
			type="button"
			class="hidden h-9 w-52 items-center gap-2 rounded-none bg-muted/50 px-3 text-sm text-muted-foreground ring-1 ring-border/60 transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring md:flex lg:w-60"
		>
			<Search class="size-4 text-blue" />
			<span class="flex-1 text-left">Search</span>
			<kbd class="rounded-none bg-background/70 px-1.5 py-0.5 text-[10px] font-medium">
				Ctrl K
			</kbd>
		</button>

		<!-- Search (mobile) -->
		<button
			type="button"
			aria-label="Search"
			class="{iconBtn} hover:bg-blue/10 hover:text-blue md:hidden"
		>
			<Search class="size-4.25" />
		</button>

		<!-- Notifications -->
		<button
			type="button"
			aria-label="Notifications"
			class="{iconBtn} relative hover:bg-gold/10 hover:text-gold"
		>
			<Bell class="size-4.25" strokeWidth={1.9} />
			<span class="absolute top-1.5 right-1.5 flex size-2">
				<span
					class="absolute inline-flex size-full rounded-full bg-primary/60 motion-safe:animate-ping"
				></span>
				<span class="relative inline-flex size-2 rounded-full bg-primary ring-2 ring-background"
				></span>
			</span>
		</button>

		<div class="mx-2 hidden h-5 w-px bg-border/60 sm:block"></div>

		<!-- Public site -->
		<a
			href="/"
			target="_blank"
			rel="noopener noreferrer"
			class="hidden h-9 items-center gap-2 rounded-none bg-primary/10 px-3 text-sm font-semibold text-primary ring-1 ring-primary/20 transition-colors outline-none hover:bg-primary/15 focus-visible:ring-2 focus-visible:ring-ring sm:flex"
		>
			<span class="relative flex size-2">
				<span
					class="absolute inline-flex size-full rounded-full bg-primary/60 motion-safe:animate-ping"
				></span>
				<span class="relative inline-flex size-2 rounded-full bg-primary"></span>
			</span>
			<span>Live site</span>
			<ExternalLink class="size-3.5" strokeWidth={2} />
		</a>
	</div>
</header>
