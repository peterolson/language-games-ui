<script lang="ts">
	import { page } from '$app/stores';
	import { locale } from 'svelte-i18n';
	import { languages } from '../../data/languages';
	import { _ } from '../../i18n';

	const { lang } = $page.params;
	let [room, langCode] = lang.split('_');
	if (!langCode) {
		langCode = room;
	}
	const { name, rtl } = languages.find((l) => l.locale === langCode && l.room === room) || {};
</script>

<svelte:head>
	<title>{name} - {$_('games')}</title>
</svelte:head>

<div class="container" class:rtl>
	<h1>{name} - {$_('games')}</h1>
</div>

<style>
	.container {
		padding: 20px;
		background: #fafafa;
		border: 1px solid #eaeaea;
		border-radius: 5px;
		margin-bottom: 20px;
	}

	.rtl {
		direction: rtl;
	}
</style>
