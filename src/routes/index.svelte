<script lang="ts">
	import { getSocket } from '../data/socket';
	import { languages } from '../data/languages';
	import { locale as _locale } from 'svelte-i18n';

	getSocket((socket) => {
		console.log(socket);
	});
</script>

{#each languages as { room, locale, name, en }}
	<div>
		<a
			href={`/${room}${locale === room ? '' : `_${locale}`}`}
			on:click={() => {
				_locale.set(locale);
			}}
		>
			{name}
			{#if name !== en}
				- {en}
			{/if}
		</a>
	</div>
{/each}
