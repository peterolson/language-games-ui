import { register, init, getLocaleFromNavigator, _ as _i18n } from 'svelte-i18n';

export function registerLocales(): void {
	register('en', () => import('./locales/en/main.json'));
	register('fr', () => import('./locales/fr/main.json'));
	register('zh-CN', () => import('./locales/zh-CN/main.json'));
	register('zh-TW', () => import('./locales/zh-TW/main.json'));
	register('es', () => import('./locales/es/main.json'));
	register('he', () => import('./locales/he/main.json'));
}

export function initializeClient(lang: string): void {
	init({
		fallbackLocale: 'en',
		initialLocale: lang || getLocaleFromNavigator()
	});
}

export function initializeServer(lang: string): void {
	init({
		fallbackLocale: 'en',
		initialLocale: lang || 'en'
	});
}

export const _ = _i18n;
