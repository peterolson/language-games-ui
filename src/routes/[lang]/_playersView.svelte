<script lang="ts">
	import type { LocalParticipant } from 'twilio-video';

	import StreamView from './streamView.svelte';

	export let playerNames: Record<string, string>;
	export let remoteTracks: Record<string, MediaStreamTrack[]>;
	export let selfId: string;
	export let userTracks: MediaStreamTrack[];
	export let localParticipant: LocalParticipant;
</script>

<main>
	<div class="videoContainer">
		<div>
			<StreamView tracks={userTracks} name={playerNames[selfId]} isSelfVideo {localParticipant} />
		</div>
		<div>
			{#each Object.keys(remoteTracks || {}) as id}
				<StreamView tracks={remoteTracks[id]} name={playerNames[id]} />
			{/each}
		</div>
		<!--
		
		
		-->
	</div>
	<div class="gameContent">
		<slot />
	</div>
</main>

<style>
	main {
		display: flex;
		height: 100%;
		width: 100%;
	}
	.videoContainer {
		display: flex;
		flex-flow: column nowrap;
		flex: 0 1;
	}

	.videoContainer div {
		height: 50%;
		max-width: 45vw;
		overflow: hidden;
	}

	.gameContent {
		flex: 1 0 auto;
		padding: 8px;
		box-sizing: border-box;
	}

	@media (orientation: portrait) {
		main {
			flex-direction: column;
		}

		.videoContainer {
			flex-direction: row;
		}

		.videoContainer div {
			height: unset;
			width: 50%;
			max-width: unset;
			max-height: 45vh;
		}
	}
</style>
