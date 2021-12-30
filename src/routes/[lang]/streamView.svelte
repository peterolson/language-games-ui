<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { Icon } from 'sveltestrap';

	export let stream: MediaStream;
	export let isSelfVideo: boolean;
	export let name = '';
	export let hideText = false;

	let video: HTMLVideoElement;

	let muted = false;
	let cameraHidden = false;

	$: {
		if (video && stream) {
			video.srcObject = stream;
			const audioTracks = stream.getAudioTracks();
			if (audioTracks.length) {
				muted = !audioTracks[0].enabled;
			}
			const videoTracks = stream.getVideoTracks();
			if (videoTracks.length) {
				cameraHidden = !videoTracks[0].enabled;
			}
		}
	}

	function toggleMute() {
		muted = !muted;
		stream.getAudioTracks()[0].enabled = !muted;
	}

	function toggleHidden() {
		cameraHidden = !cameraHidden;
		stream.getVideoTracks()[0].enabled = !cameraHidden;
	}
</script>

<div class="videoContainer">
	<video playsinline autoplay bind:this={video} muted={isSelfVideo} />
	{#if name}
		<div class="name">{name}</div>
	{/if}
	{#if stream}
		<div class="muteContainer">
			<button class="btn btn-light" on:click={toggleMute}>
				<Icon name={muted ? 'mic-fill' : 'mic-mute-fill'} />
				{#if !hideText}
					{muted ? $_('media.unmute') : $_('media.mute')}
				{/if}
			</button>
			<button class="btn btn-light" on:click={toggleHidden}>
				<Icon name={cameraHidden ? 'camera-video-fill' : 'camera-video-off-fill'} />
				{#if !hideText}
					{cameraHidden ? $_('media.showVideo') : $_('media.hideVideo')}
				{/if}
			</button>
		</div>
	{/if}
</div>

<style>
	.videoContainer {
		position: relative;
		display: inline-block;
		background-color: black;
		line-height: 0;
		width: 100%;
		height: 100%;
	}

	video {
		width: 100%;
		height: 100%;
		margin: auto;
	}

	.muteContainer {
		position: absolute;
		bottom: 0;
		right: 0;
		padding: 0;
		margin: 8px;
	}

	.muteContainer button {
		opacity: 0.75;
		font-size: 13px;
		padding: 4px 8px;
	}

	.name {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		background-color: rgba(0, 0, 0, 0.7);
		color: white;
		line-height: 1.5;
		text-align: center;
		width: 100%;
		text-overflow: ellipsis;
		height: 1.5em;
		white-space: nowrap;
		overflow: hidden;
	}
</style>
