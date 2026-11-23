const tones = ['var(--paper)', 'var(--c2)', 'var(--c3)', 'var(--c4)'];

const positions = [
	{ x: 14, y: 20, r: -4, tone: 'var(--paper)' },
	{ x: 36, y: 10, r: 3, tone: 'var(--c3)' },
	{ x: 84, y: 20, r: -3, tone: 'var(--c2)' },
	{ x: 72, y: 36, r: 4, tone: 'var(--c4)' },
	{ x: 11, y: 52, r: -2, tone: 'var(--c3)' },
	{ x: 84, y: 56, r: 2, tone: 'var(--paper)' },
	{ x: 34, y: 78, r: -3, tone: 'var(--c3)' },
	{ x: 66, y: 80, r: 3, tone: 'var(--c3)' },
	{ x: 14, y: 82, r: -5, tone: 'var(--c2)' }
];

function hashId(id: string): number {
	let hash = 0;

	for (const char of id) {
		hash = (hash * 31 + char.charCodeAt(0)) | 0;
	}

	return hash >>> 0;
}

function getShort(name: string): string {
	const abbreviations: Record<string, string> = {
		TypeScript: 'TS',
		React: 'Re',
		Astro: 'As',
		SolidJS: 'So',
		'C#': 'C#',
		'ASP.NET': '.N',
		'Node.js': 'No',
		PostgreSQL: 'Pg',
		'SQL Server': 'Sq'
	};

	return abbreviations[name] ?? name.slice(0, 2).toUpperCase();
}

export function getSkillLayout(id: string, name: string, index: number) {
	const hash = hashId(id);
	const position = positions[index];

	return {
		short: getShort(name),
		x: position?.x ?? 50,
		y: position?.y ?? 50,
		r: position?.r ?? ((hash >>> 16) % 11) - 5,
		tone: position?.tone ?? tones[(hash >>> 24) % tones.length],
		delay: index * 0.35
	};
}
