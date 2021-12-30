<script lang="ts">
	import StreamView from './streamView.svelte';

	export let playerNames: Record<string, string>;
	export let remoteStreams: Record<string, MediaStream>;
	export let selfId: string;

	let screenWidth: number;
	let screenHeight: number;
	let videoWidth = 120;
	let videoHeight = 90;
	let aspectRatio = 4 / 3;
	let isVertical = true;

	$: {
		let totalPlayers = Object.keys(playerNames).length;
		const availableHeight = screenHeight - 24;
		const minWidth = Math.min(screenWidth / 2, 180);
		const minHeight = Math.min(availableHeight / 2, 135);

		let horizontalVideoWidth = minWidth;
		if (screenWidth / totalPlayers > minWidth) {
			horizontalVideoWidth = screenWidth / totalPlayers;
		}
		const horizontalVideoHeight = horizontalVideoWidth / aspectRatio;

		let verticalVideoHeight = minHeight;
		if (availableHeight / totalPlayers > minHeight) {
			verticalVideoHeight = availableHeight / totalPlayers;
		}
		const verticalVideoWidth = verticalVideoHeight * aspectRatio;

		if (horizontalVideoWidth < verticalVideoWidth) {
			isVertical = false;
			videoWidth = horizontalVideoWidth;
			videoHeight = horizontalVideoHeight;
		} else {
			isVertical = true;
			videoWidth = verticalVideoWidth;
			videoHeight = verticalVideoHeight;
		}
	}
</script>

<svelte:window bind:innerHeight={screenHeight} />

<main bind:clientWidth={screenWidth} class:vertical={!isVertical}>
	<div class="videoContainer" class:vertical={isVertical}>
		<div style={`height:${videoHeight}px;width:${videoWidth}px`}>
			<StreamView
				stream={remoteStreams?.[selfId]}
				name={playerNames[selfId]}
				isSelfVideo
				hideText={videoWidth < 250}
			/>
		</div>
		{#each Object.keys(playerNames).filter((k) => k !== selfId) as id}
			<div style={`height:${videoHeight}px;width:${videoWidth}px`}>
				<StreamView
					stream={remoteStreams?.[id]}
					name={playerNames[id]}
					isSelfVideo={false}
					hideText={videoWidth < 250}
				/>
			</div>
		{/each}
	</div>
	<div class="gameContent">
		<slot />
	</div>
</main>

<style>
	main {
		display: flex;
		flex-wrap: wrap;
		margin-left: -12px;
		margin-right: -12px;
		height: 100%;
	}
	.videoContainer {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-evenly;
		background-color: black;
	}
	.vertical {
		flex-direction: column;
	}

	.gameContent {
		flex-grow: 1;
		padding: 8px;
	}
</style>
