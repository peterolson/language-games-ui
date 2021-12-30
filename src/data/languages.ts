export type Language = {
	locale: string;
	room: string;
	name: string;
	en: string;
	rtl: boolean;
};

function l(room, name, en, rtl = false, locale = room) {
	return { room, locale, name, en, rtl };
}

export const languages: Language[] = [
	l('en', 'English', 'English'),
	l('fr', 'Français', 'French'),
	l('zh', '中文（简体）', 'Chinese - Mandarin (Simplified)', false, 'zh-CN'),
	l('zh', '中文（繁體）', 'Chinese - Mandarin (Traditional)', false, 'zh-TW'),
	l('es', 'Español', 'Spanish'),
	l('he', 'עברית', 'Hebrew', true),
	l('asl', 'ASL', 'American Sign Language', false, 'en')
];

export function parseLang(lang: string): { room: string; langCode: string; language: Language } {
	const [room, tail] = lang.split('_');
	const langCode = tail || room;
	const language = languages.find((l) => l.locale === langCode && l.room === room);
	return { room, langCode, language };
}
