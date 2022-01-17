<script context="module">
	import { browser } from '$app/env';
	import { locale, waitLocale } from 'svelte-i18n';

	import { initializeClient, initializeServer, registerLocales } from '../i18n';

	registerLocales();

	export const load = async ({ page }) => {
		if (!browser) {
			initializeServer('');
		} else {
			initializeClient('');
		}
		await waitLocale();
		return {};
	};
</script>

<slot />
