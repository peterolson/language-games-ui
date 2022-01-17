import { register, init, getLocaleFromNavigator, _ as _i18n } from 'svelte-i18n';
import { interfaceLanguages } from './data/languages';

const locales = interfaceLanguages.map((l) => l.locale);

export function registerLocales(): void {
	register('en', () => import('./locales/en/main.json'));
	register('fr', () => import('./locales/fr/main.json'));
	register('zh-CN', () => import('./locales/zh-CN/main.json'));
	register('zh-TW', () => import('./locales/zh-TW/main.json'));
	register('es', () => import('./locales/es/main.json'));
	register('he', () => import('./locales/he/main.json'));
	register('ru', () => import('./locales/ru/main.json'));
}

export function initializeClient(lang: string): void {
	let l = lang || getLocaleFromNavigator();
	if (!locales.includes(l)) {
		l = l.split('-')[0];
	}
	if (!locales.includes(l)) {
		l = 'en';
	}
	init({
		fallbackLocale: 'en',
		initialLocale: l
	});
}

export function initializeServer(lang: string): void {
	init({
		fallbackLocale: 'en',
		initialLocale: lang || 'en'
	});
}

export const _ = _i18n;
