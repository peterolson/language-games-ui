<script context="module">
	import { browser } from '$app/env';
	import { locale, waitLocale } from 'svelte-i18n';

	import { initializeClient, initializeServer, registerLocales } from '../i18n';

	registerLocales();

	export const load = async ({ page }) => {
		const lang = page.params.lang || '';
		let [room, langCode] = lang.split('_');
		if (!langCode) {
			langCode = room;
		}
		if (!browser) {
			initializeServer(langCode);
		} else {
			initializeClient(langCode);
		}
		if (langCode) {
			locale.set(langCode);
		}
		await waitLocale();
		return {};
	};
</script>

<slot />
