<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { Icon } from 'sveltestrap';

	export let name = '';
	export let hideText = false;
	export let tracks: MediaStreamTrack[];
	export let isSelfVideo = false;

	let video: HTMLVideoElement;
	let audio: HTMLAudioElement;
	let muted = false;
	let cameraHidden = false;

	$: {
		tracks?.forEach((track) => {
			if (track.kind === 'video') {
				cameraHidden = !track.enabled;
				if (video) {
					video.srcObject = streamFromTrack(track);
				}
			}
			if (track.kind === 'audio') {
				muted = !track.enabled;
				if (audio) {
					audio.srcObject = streamFromTrack(track);
				}
			}
		});
	}

	function toggleMute() {
		muted = !muted;
		tracks.forEach((track) => {
			if (track.kind === 'audio') {
				track.enabled = !muted;
			}
		});
	}

	function toggleHidden() {
		cameraHidden = !cameraHidden;
		tracks.forEach((track) => {
			if (track.kind === 'video') {
				track.enabled = !cameraHidden;
			}
		});
	}

	function streamFromTrack(track: MediaStreamTrack) {
		const stream = new MediaStream();
		stream.addTrack(track);
		return stream;
	}
</script>

<div class="videoContainer">
	<div class="mediaContainer">
		<!-- svelte-ignore a11y-media-has-caption -->
		<video playsinline autoplay bind:this={video} />
		<audio autoplay bind:this={audio} muted={isSelfVideo} />
	</div>
	{#if name}
		<div class="name">{name}</div>
	{/if}
	{#if tracks?.length}
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

	.mediaContainer,
	.mediaContainer video {
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
