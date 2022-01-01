<script lang="ts">
	import { browser } from '$app/env';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import TestAudio from './_testAudio.svelte';
	import { Alert, Icon, FormGroup, Input, Label } from 'sveltestrap';
	import { nameStore } from '../../data/stores';
	import StreamView from './streamView.svelte';

	export let onSelectedMedia: (stream: MediaStream, name: string) => void;
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
		} catch (error) {
			console.log(error);
		}
	}

	onMount(async () => {
		if (!browser) return;
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				audio: noiseCancellation,
				video: true
			});
			const devices = await navigator.mediaDevices.enumerateDevices();
			gotDevices(devices);
		} catch (error) {
			handleError(error);
		}
	});

	function onSubmit(event: Event) {
		event.preventDefault();
		onSelectedMedia(stream, $nameStore);
	}
</script>

<div class="container">
	<form on:submit={onSubmit}>
		<FormGroup>
			<Label for="name">{$_('game.nameInput')}</Label>
			<Input id="name" bind:value={$nameStore} required placeholder={$_('game.namePlaceholder')} />
		</FormGroup>
		<button class="btn btn-primary" type="submit" color="primary" disabled={!stream}>
			{$_('game.userReady')}
		</button>
	</form>
	<div>
		{#if errorMessage}
			<Alert color="danger">
				{errorMessage}
			</Alert>
		{:else}
			<div class="videoPreview">
				<StreamView {stream} isSelfVideo />
			</div>

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

				<div>&nbsp;&nbsp;</div>
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
		margin: auto;
		width: 100%;
		max-width: 640px;
		padding: 8px;
		box-sizing: border-box;
		text-align: center;
	}

	form {
		padding-bottom: 16px;
	}

	form button {
		width: 100%;
	}

	.videoPreview {
		height: calc(100vh - 300px);
	}

	.inputs {
		display: flex;
		justify-content: space-between;
	}

	select {
		width: 100%;
	}
</style>
