<script lang="ts">
	import { browser } from '$app/env';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import TestAudio from './_testAudio.svelte';
	import { Alert } from 'sveltestrap';
	import StreamView from './streamView.svelte';
	import type { RoomSettings } from './roomSettings.types';

	export let onSetSettings: (settings: Partial<RoomSettings>) => void;
	export let settings: Partial<RoomSettings>;

	const noiseCancellation = {
		autoGainControl: true,
		echoCancellation: true,
		noiseSuppression: true
	};

	let microphones: MediaDeviceInfo[] = [];
	let selectedMicrophone: string;
	let cameras: MediaDeviceInfo[] = [];
	let selectedCamera: string;
	let errorMessage: string;

	let stream: MediaStream;
	let tracks: MediaStreamTrack[];

	function gotDevices(deviceInfos: MediaDeviceInfo[]) {
		for (const deviceInfo of deviceInfos) {
			if (deviceInfo.kind === 'audioinput') {
				microphones.push(deviceInfo);
			} else if (deviceInfo.kind === 'videoinput') {
				cameras.push(deviceInfo);
			}
		}
		microphones = microphones;
		cameras = cameras;
		selectedMicrophone = selectedMicrophone || microphones[0].deviceId;
		selectedCamera = selectedCamera || cameras[0].deviceId;
	}

	function handleError(error) {
		console.error(error, error.name);
		if (error.name === 'NotAllowedError') {
			errorMessage = $_('error.noPermission');
		} else if (error.name === 'NotReadableError') {
			errorMessage = $_('error.videoNotReadable');
		} else {
			errorMessage = error.message || String(error);
		}
	}

	async function changeInput() {
		try {
			const constraints = {
				audio: { deviceId: selectedMicrophone, ...noiseCancellation },
				video: { deviceId: selectedCamera }
			};
			const newStream = await navigator.mediaDevices.getUserMedia(constraints);
			stream.getTracks().forEach((track) => track.stop());
			stream = newStream;
			attachTracks(newStream);
		} catch (error) {
			console.log(error);
		}
	}

	function attachTracks(stream: MediaStream) {
		if (settings?.tracks) {
			settings.tracks.forEach((track) => track.stop());
		}
		tracks = stream.getTracks();
		onSetSettings({
			tracks
		});
	}

	onMount(async () => {
		if (!browser) return;
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				audio: noiseCancellation,
				video: true
			});
			attachTracks(stream);
			const devices = await navigator.mediaDevices.enumerateDevices();
			gotDevices(devices);
		} catch (error) {
			handleError(error);
		}
	});
</script>

<div class="videoPreview">
	<StreamView bind:tracks isSelfVideo soloView />
</div>
<div class="footer">
	{#if errorMessage}
		<Alert color="danger">
			{errorMessage}
		</Alert>
	{:else}
		<div class="inputs">
			{#if microphones.length}
				<div>
					<label for="microphones">{$_('media.microphone')}</label>
					<select id="microphones" bind:value={selectedMicrophone} on:change={changeInput}>
						{#each microphones as microphone, i}
							<option value={microphone.deviceId}>
								{microphone.label || `${$_('media.microphone')} ${i}`}
							</option>
						{/each}
					</select>
					<TestAudio {stream} />
				</div>
			{/if}
			{#if cameras.length}
				<div>
					<label for="cameras">{$_('media.camera')}</label>
					<select id="cameras" bind:value={selectedCamera} on:change={changeInput}>
						{#each cameras as camera, i}
							<option value={camera.deviceId}>
								{camera.label || `${$_('media.camera')} ${i}`}
							</option>
						{/each}
					</select>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.videoPreview {
		width: 100%;
		display: flex;
		background-color: black;
		justify-content: center;
	}

	select {
		width: 100%;
	}

	label {
		opacity: 0.8;
		display: block;
	}

	.inputs {
		display: flex;
		max-width: 640px;
	}
	.inputs div {
		width: 100%;
	}
</style>
