export const themes = [
	{ id: 'original', label: 'Original' },
	{ id: 'warm', label: 'Warm' },
	{ id: 'graphite', label: 'Graphite' },
	{ id: 'midnight', label: 'Midnight' }
] as const;

export type ThemeId = (typeof themes)[number]['id'];

const KEY = 'theme';

const isTheme = (value: string | null): value is ThemeId => themes.some((t) => t.id === value);

class ThemeState {
	current = $state<ThemeId>('original');

	init() {
		try {
			const saved = localStorage.getItem(KEY);
			this.apply(isTheme(saved) ? saved : 'original');
		} catch {
			this.apply('original');
		}
	}

	set(id: ThemeId) {
		this.apply(id);

		try {
			localStorage.setItem(KEY, id);
		} catch {
			// localStorage غير متاح
		}
	}

	private apply(id: ThemeId) {
		this.current = id;
		document.documentElement.dataset.theme = id;
	}
}

export const theme = new ThemeState();
