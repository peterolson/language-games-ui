<script lang="ts">
	import { getSocket } from '../data/socket';
	import { interfaceLanguages, isRTL, targetLanguages } from '../data/languages';
	import { locale as _locale, _ } from 'svelte-i18n';

	getSocket((socket) => {
		console.log(socket);
	});
</script>

<svelte:head>
	<title>{$_('site.title')}</title>
</svelte:head>

<div class="container bg-light" class:rtl={isRTL($_locale)}>
	<div class="px-4 py-4 mt-1 mb-1 text-center">
		<img class="d-block mx-auto mb-1" src="/icon.svg" alt="" width="128" height="128" />
		<h1 class="display-5 fw-bold">{$_('site.title')}</h1>
		<div class="mx-auto">
			<p class="lead mb-4">{$_('site.description')}</p>
		</div>
		<div>
			{$_('site.interfaceLanguagePrompt')}
			<select bind:value={$_locale} class="bg-light">
				{#each interfaceLanguages as { locale, name, en }}
					<option value={locale}>{name}</option>
				{/each}
			</select>
		</div>
	</div>
	<h2 class="display-6 fw-bold text-center">{$_('site.targetLanguagePrompt')}</h2>
	<div class="language-grid">
		{#each targetLanguages as { en, code, name }}
			<a href={`/${code}`} class="btn btn-outline-secondary btn-lg px-4">
				{name}
				<p>{en}</p>
			</a>
		{/each}
	</div>
</div>

<style>
	.container {
		border: 1px solid #ccc;
		border-radius: 32px;
	}
	.language-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
		gap: 8px;
		padding: 16px;
	}

	.btn p {
		opacity: 0.8;
		font-size: 1rem;
		margin-bottom: 8px;
	}

	.rtl {
		direction: rtl;
	}
</style>
