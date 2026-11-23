export type AboutTab = {
	id: string;
	title: string;
	pill: string;
	lines: string[];
	text: string;
};

export type About = {
	tabs: AboutTab[];
};

export type Hero = {
	name: string;
	headline: string;
	lines: string[];
	description: string;
};

export type ContactLink = {
	id: string;
	label: string;
	hint:string;
	href: string;
};

export type Contact = {
	links: ContactLink[];
};
export type Profile = {
	id: string;
	about: About;
	hero: Hero;
	contact: Contact;
};
