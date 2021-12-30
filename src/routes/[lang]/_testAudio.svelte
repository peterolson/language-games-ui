<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { Button, Spinner } from 'sveltestrap';

	export let stream: MediaStream;
	let isRecording = false;
	let isPlayingBack = false;

	function testAudio() {
		isRecording = true;
		const recorder = new MediaRecorder(stream);
		recorder.start();
		setTimeout(() => {
			recorder.stop();
			isRecording = false;
			isPlayingBack = true;
			recorder.ondataavailable = (e) => {
				const url = URL.createObjectURL(e.data);
				const audio = new Audio(url);
				audio.play();
				audio.onended = () => {
					isPlayingBack = false;
				};
			};
		}, 5000);
		console.log('testAudio');
	}
</script>

<div class="container">
	{#if isRecording}
		<Spinner type="grow" color="danger" />&nbsp;&nbsp;{$_('media.testAudioRecording')}
	{:else if isPlayingBack}
		{$_('media.testAudioPlayingBack')}
	{:else}
		<Button outline on:click={testAudio}>{$_('media.testAudio')}</Button>
	{/if}
</div>

<style>
	.container {
		padding: 0;
		padding-top: 4px;
		display: flex;
		align-items: center;
	}
</style>
