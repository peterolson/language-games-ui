<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { Icon } from 'sveltestrap';
	import type { LocalParticipant } from 'twilio-video';

	export let name = '';
	export let tracks: MediaStreamTrack[];
	export let isSelfVideo = false;
	export let localParticipant: LocalParticipant = null;
	export let soloView = false;

	let video: HTMLVideoElement;
	let audio: HTMLAudioElement;
	let muted = false;
	let cameraHidden = false;

	$: {
		if (localParticipant) {
			localParticipant.audioTracks.forEach((publication) => {
				const track = publication.track;
				muted = !track.isEnabled;
				if (audio) {
					track.attach(audio);
				}
			});
			localParticipant.videoTracks.forEach((publication) => {
				const track = publication.track;
				cameraHidden = !track.isEnabled;
				if (video) {
					track.attach(video);
				}
			});
		} else {
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
	}

	function toggleMute() {
		muted = !muted;
		if (localParticipant) {
			localParticipant.audioTracks.forEach((publication) => {
				const track = publication.track;
				if (muted) track.disable();
				else track.enable();
			});
			return;
		}
		tracks.forEach((track) => {
			if (track.kind === 'audio') {
				track.enabled = !muted;
			}
		});
	}

	function toggleHidden() {
		cameraHidden = !cameraHidden;
		if (localParticipant) {
			localParticipant.videoTracks.forEach((publication) => {
				const track = publication.track;
				if (cameraHidden) track.disable();
				else track.enable();
			});
			return;
		}
		tracks.forEach((track) => {
			if (track.kind === 'video') {
				track.enabled = !cameraHidden;
			}
		});
		console.log(tracks);
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
		<video playsinline autoplay bind:this={video} class:solo-view={soloView} />
		<audio autoplay bind:this={audio} muted={isSelfVideo} />
	</div>
	{#if name}
		<div class="name">{name}</div>
	{/if}
	{#if tracks?.length}
		<div class="muteContainer">
			<button class="btn btn-light" on:click={toggleMute}>
				<Icon name={muted ? 'mic-fill' : 'mic-mute-fill'} />
				<span class="hide-text">
					{muted ? $_('media.unmute') : $_('media.mute')}
				</span>
			</button>
			<button class="btn btn-light" on:click={toggleHidden}>
				<Icon name={cameraHidden ? 'camera-video-fill' : 'camera-video-off-fill'} />
				<span class="hide-text">
					{cameraHidden ? $_('media.showVideo') : $_('media.hideVideo')}
				</span>
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
		height: 100%;
		width: 100%;
	}

	.mediaContainer {
		height: 100%;
		width: 100%;
		margin: auto;
	}

	.mediaContainer video {
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

	video.solo-view {
		width: 100%;
		height: 100%;
	}

	@media (orientation: portrait) {
		.mediaContainer video {
			height: unset;
			width: 100%;
		}

		video.solo-view {
			width: 100%;
			height: 100%;
		}
	}

	@media (max-width: 375px) {
		.hide-text {
			display: none;
		}
	}

	@media (max-height: 350px) {
		.hide-text {
			display: none;
		}
	}
</style>
