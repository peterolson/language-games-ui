<script lang="ts">
	import { page } from '$app/stores';
	import { games } from '../../games';
	import { parseLang } from '../../data/languages';
	import { _ } from '../../i18n';

	const { lang } = $page.params;
	const { room, langCode, language } = parseLang(lang);
	const { name, rtl } = language;
</script>

<svelte:head>
	<title>{language.name} - {$_('games')}</title>
</svelte:head>

<div class="container" class:rtl>
	<nav>
		<a href="/">{$_('home')}</a>&nbsp;/&nbsp;
		{language.name}
	</nav>
	<div class="gameList">
		<h1>{$_('games')}</h1>

		{#each games as { Summary, key }}
			<div class="game">
				<strong>{$_(`${key}.name`)}</strong>
				<Summary />
				<a href={`/${lang}/play?games=${key}`}>{$_('play')}</a>
			</div>
		{/each}
	</div>
</div>

<style>
	nav {
		display: flex;
		padding: 0 8px;
	}

	.gameList {
		margin: auto;
		width: 100%;
		max-width: 640px;
	}

	.game {
		border: 1px solid black;
		padding: 8px;
		margin: 8px;
	}

	.rtl {
		direction: rtl;
	}
</style>
