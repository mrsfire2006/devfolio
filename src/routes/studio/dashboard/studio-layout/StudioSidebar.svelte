<script lang="ts">
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import {
		ArrowUpRight,
		BadgeCheck,
		ChevronsUpDown,
		Globe,
		Layers,
		Plus,
		Search,
		SlidersVertical,
		Sparkles,
		User,
		Wrench
	} from '@lucide/svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import DevfolioLogo from '#lib/components/shared/DevfolioLogo.svelte';
	import { getProjects } from '#lib/queries/projects.ts';
	import { getSkills } from '#lib/queries/skills.ts';
	import CreateProjectDialog from '../projects/_components/CreateProjectDialog.svelte';
	import { authClient } from '#lib/auth-client.ts';

	type Tone = 'primary' | 'blue' | 'violet' | 'gold';

	type NavItem = {
		title: string;
		href: string;
		icon: typeof Layers;
		tone: Tone;
		badge?: number;
	};

	// classes ثابتة عشان Tailwind يشوفها، والألوان من tokens الـ theme
	const tones: Record<Tone, { tile: string; active: string; bar: string; text: string }> = {
		primary: {
			tile: 'bg-primary/15 text-primary',
			active: 'bg-primary text-primary-foreground',
			bar: 'bg-primary',
			text: 'text-primary'
		},
		blue: {
			tile: 'bg-blue/15 text-blue',
			active: 'bg-blue text-background',
			bar: 'bg-blue',
			text: 'text-blue'
		},
		violet: {
			tile: 'bg-violet/15 text-violet',
			active: 'bg-violet text-background',
			bar: 'bg-violet',
			text: 'text-violet'
		},
		gold: {
			tile: 'bg-gold/15 text-gold',
			active: 'bg-gold text-background',
			bar: 'bg-gold',
			text: 'text-gold'
		}
	};

	// ── Counts للـ badges ──
	const projects = getProjects('PRIVATE');
	const skills = getSkills();

	const projectsCount = $derived(projects.data?.value?.length ?? 0);
	const skillsCount = $derived(skills.data?.value?.length ?? 0);

	const contentNav: NavItem[] = $derived([
		{
			title: 'Projects',
			href: resolve('/studio/dashboard/projects'),
			icon: Layers,
			tone: 'primary',
			badge: projectsCount
		},
		{
			title: 'Skills',
			href: resolve('/studio/dashboard/skills'),
			icon: BadgeCheck,
			tone: 'blue',
			badge: skillsCount
		},
		{
			title: 'Profile',
			href: resolve('/studio/dashboard/profile'),
			icon: User,
			tone: 'gold',
		 
		}
	]);

	const systemNav: NavItem[] = [
		{
			title: 'Settings',
			href: resolve('/studio/dashboard/settings'),
			icon: SlidersVertical,
			tone: 'violet'
		}
	];

	const isActive = (href: string) => page.url.pathname.startsWith(href);

	const session = authClient.useSession();

	const username = $derived($session.data?.user?.name ?? '');

	const subname = $derived(username.slice(0, 2));
</script>

{#snippet navGroup(label: string, GroupIcon: typeof Layers, items: NavItem[])}
	<Sidebar.Group class="px-0 py-2">
		<Sidebar.GroupLabel
			class="mb-1 h-6 gap-1.5 px-3 text-[10px] font-semibold tracking-[0.18em] text-sidebar-foreground/50 uppercase"
		>
			<GroupIcon class="size-3" />
			{label}
		</Sidebar.GroupLabel>

		<Sidebar.GroupContent>
			<Sidebar.Menu class="gap-1">
				{#each items as item (item.href)}
					{@const active = isActive(item.href)}
					{@const tone = tones[item.tone]}

					<Sidebar.MenuItem class="relative">
						<!-- خط ملوّن على الشمال للعنصر النشط -->
						{#if active}
							<span class="absolute top-2 bottom-2 left-0 z-10 w-0.75 rounded-r-full {tone.bar}"
							></span>
						{/if}

						<Sidebar.MenuButton
							isActive={active}
							class="
								group/nav h-12 rounded-none px-2.5 text-sidebar-foreground transition-colors
								hover:bg-sidebar-accent hover:text-sidebar-foreground
								data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium
								data-[active=true]:text-sidebar-accent-foreground
							"
						>
							{#snippet child({ props })}
								<a href={item.href} {...props} aria-current={active ? 'page' : undefined}>
									<span
										class="flex size-8 shrink-0 items-center justify-center transition-all duration-200
											{active ? tone.active : tone.tile} group-hover/nav:scale-105"
									>
										<item.icon class="size-4.25" strokeWidth={active ? 2.2 : 1.8} />
									</span>

									<span class="flex-1 text-[14px] font-medium tracking-tight">
										{item.title}
									</span>

									{#if item.badge !== undefined}
										<span
											class="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums
												{active ? tone.active : tone.tile}"
										>
											{item.badge}
										</span>
									{/if}
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				{/each}
			</Sidebar.Menu>
		</Sidebar.GroupContent>
	</Sidebar.Group>
{/snippet}

<Sidebar.Root class="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
	<!-- glow خفيف بلون الـ theme في أعلى الـ sidebar -->
	<div
		class="pointer-events-none absolute inset-x-0 top-0 h-48"
		style="background: radial-gradient(ellipse 90% 100% at 30% 0, color-mix(in oklab, var(--primary) 14%, transparent), transparent)"
	></div>

	<Sidebar.Header class="relative gap-4 px-4 pt-5 pb-3">
		<a
			href={resolve('/studio/dashboard/projects')}
			aria-label="devfolio studio, go to projects"
			class="-mx-1 rounded-none p-1 transition-opacity hover:opacity-90"
		>
			<DevfolioLogo subtext="Dashboard" />
		</a>

		<div class="flex items-center gap-2">
			<button
				type="button"
				class="
					flex h-10 flex-1 items-center gap-2 rounded-none bg-sidebar-accent px-3 text-sm
					text-sidebar-foreground/70 ring-1 ring-sidebar-border transition-colors
					hover:bg-sidebar-accent/80 hover:text-sidebar-foreground
					focus-visible:ring-2 focus-visible:ring-sidebar-ring
				"
			>
				<Search class="size-4 shrink-0 text-blue" />
				<span class="flex-1 text-left">Search</span>
				<kbd
					class="rounded-none bg-sidebar px-1.5 py-0.5 text-[10px] font-medium text-sidebar-foreground/60"
				>
					Ctrl K
				</kbd>
			</button>

			<CreateProjectDialog>
				{#snippet trig()}
					<div
						aria-label="New project"
						class="
							flex size-10 shrink-0 items-center justify-center rounded-none bg-sidebar-primary
							text-sidebar-primary-foreground shadow-sm transition-all
							hover:opacity-90 focus-visible:ring-2 focus-visible:ring-sidebar-ring active:scale-95
						"
					>
						<Plus class="size-4.5" strokeWidth={2.4} />
					</div>
				{/snippet}
			</CreateProjectDialog>
		</div>
	</Sidebar.Header>

	<Sidebar.Content class="relative gap-0 px-4">
		{@render navGroup('Content', Sparkles, contentNav)}
		{@render navGroup('System', Wrench, systemNav)}
	</Sidebar.Content>

	<Sidebar.Footer class="relative gap-3 p-4 pt-2">
		<!-- Portfolio link -->
		<a
			href="/"
			target="_blank"
			rel="noopener noreferrer"
			class="
				group relative flex items-center gap-3 overflow-hidden rounded-none bg-sidebar-accent p-3
				ring-1 ring-sidebar-border transition-colors hover:bg-sidebar-accent/80
			"
		>
			<span
				class="pointer-events-none absolute -top-8 -right-8 size-24 rounded-full bg-primary/15 blur-2xl"
			></span>

			<span class="relative flex size-9 shrink-0 items-center justify-center bg-gold/15 text-gold">
				<Globe class="size-4.5" />
				<span class="absolute -top-0.5 -right-0.5 flex size-2.5">
					<span
						class="absolute inline-flex size-full rounded-full bg-primary/50 motion-safe:animate-ping"
					></span>
					<span class="relative inline-flex size-2.5 rounded-full bg-primary"></span>
				</span>
			</span>

			<div class="relative min-w-0 flex-1 leading-tight">
				<p class="text-sm font-semibold text-sidebar-foreground">Portfolio is live</p>
				<p class="mt-0.5 text-xs text-sidebar-foreground/60">View your public site</p>
			</div>

			<ArrowUpRight
				class="relative size-4 text-sidebar-foreground/55 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-sidebar-primary"
			/>
		</a>

		<!-- User + theme -->
		<div class="flex items-center gap-2 border-t border-sidebar-border pt-3">
			<button
				type="button"
				class="flex min-w-0 flex-1 items-center gap-3 rounded-none p-1.5 text-left transition-colors hover:bg-sidebar-accent"
			>
				<div
					class="flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-violet text-xs font-semibold text-primary-foreground uppercase"
				>
					{subname}
				</div>

				<div class="min-w-0 flex-1 leading-tight">
					<p class="truncate text-sm font-semibold text-sidebar-foreground">{username}</p>
					<p class="mt-0.5 truncate text-xs text-sidebar-foreground/60">Administrator</p>
				</div>

				<ChevronsUpDown class="size-4 shrink-0 text-sidebar-foreground/55" />
			</button>
		</div>
	</Sidebar.Footer>
</Sidebar.Root>
