<script lang="ts">
	import { browser } from '$app/env';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import TestAudio from './_testAudio.svelte';
	import { Alert, Icon, FormGroup, Input, Label } from 'sveltestrap';
	import { nameStore } from '../../data/stores';
	import StreamView from './streamView.svelte';
	import { getAccesToken, getTwilioVideo } from '../twilio';
	import { getSocket } from '../../data/socket';

	export let onSelectedMedia: (tracks: MediaStreamTrack[], name: string) => void;
	export let onSetTracks: (tracks: MediaStreamTrack[]) => void;

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
		tracks = stream.getTracks();
		onSetTracks(tracks);
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

	function onSubmit(event: Event) {
		event.preventDefault();
		onSelectedMedia(tracks, $nameStore);
	}
</script>

<div class="container">
	<div class="area-a">
		<form on:submit={onSubmit}>
			<FormGroup>
				<Label for="name">{$_('game.nameInput')}</Label>
				<Input
					id="name"
					bind:value={$nameStore}
					required
					placeholder={$_('game.namePlaceholder')}
				/>
			</FormGroup>
			<button class="btn btn-primary" type="submit" color="primary" disabled={!stream}>
				{$_('game.userReady')}
			</button>
		</form>
	</div>
	<div class="area-b">
		<div class="videoPreview">
			<StreamView bind:tracks isSelfVideo soloView />
		</div>
	</div>
	<div class="area-c">
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
</div>

<style>
	.container {
		width: 100%;
		height: 100%;
		display: grid;
		grid-template-rows: max-content minmax(0, 1fr) max-content;
		grid-template-areas:
			'a'
			'b'
			'c';
	}

	@media (max-height: 500px) {
		.container {
			grid-template-rows: minmax(0, 1fr) max-content;
			grid-template-columns: max-content minmax(0, 1fr);
			grid-template-areas:
				'a b'
				'. c';
		}
	}

	.area-a {
		grid-area: a;
		justify-self: center;
		align-self: center;
		padding: 8px;
	}
	.area-b {
		grid-area: b;
		max-width: 640px;
		justify-self: center;
	}
	.area-c {
		grid-area: c;
		justify-self: center;
		max-width: 640px;
		padding: 8px;
	}

	form {
		max-width: 640px;
		padding: 16px;
	}

	form button {
		width: 100%;
	}

	.videoPreview {
		height: 100%;
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
