<script lang="ts">
	import { Button } from 'sveltestrap';
	import { games } from '../../../games';

	export let onChooseGame: (game: string) => void;
</script>

{#each games as game}
	<svelte:component this={game.Summary} />
	<Button color="primary" on:click={() => onChooseGame(game.key)}>Play</Button>
{/each}
