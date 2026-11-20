// src/lib/components/skills/lucide-icons.ts
import * as lucide from '@lucide/svelte';
import type { Component } from 'svelte';

type IconComponent = Component<{ class?: string }>;

export const iconMap = Object.fromEntries(
	Object.entries(lucide).filter(
		([name, value]) =>
			/^[A-Z]/.test(name) &&
			!name.endsWith('Icon') &&
			!name.startsWith('Lucide') &&
			typeof value === 'function'
	)
) as unknown as Record<string, IconComponent>;

export const iconNames = Object.keys(iconMap).sort();
