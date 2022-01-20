<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { Spinner } from 'sveltestrap';
	import { Random } from '../../data/random';

	export let selfId: string;
	export let room: string;
	export let addMessageListener: (listener: (id: string, message: string) => void) => void;
	export let removeMessageListener: (listener: (id: string, message: string) => void) => void;
	export let sendMessage: (message: unknown) => void;
	export let playerNames: Record<string, string>;

	const random = new Random(room);
	const playerIds = random.shuffle(Object.keys(playerNames).sort());

	let imageURLS: string[] = [];
	let chooserIndex = 0;
	let chooserId: string;
	let isChooser: boolean;
	let translationValues: { values: Record<string, string> };
	$: {
		chooserId = playerIds[chooserIndex];
		isChooser = chooserId === selfId;
		translationValues = {
			values: {
				0: playerNames[chooserId],
				1: Object.keys(playerNames)
					.filter((x) => x !== chooserId)
					.map((x) => playerNames[x])
					.join(', ')
			}
		};
	}
	let currentPhase = 'choosing'; // choosing, guessing, revealing
	let chosenFace;
	let eliminatedFaces = new Set<number>();
	let playerGuesses: Record<string, number> = {};
	let revealTimestamp: number;
	let timeRemaining: number;

	let timeouts = [];
	let intervals = [];

	const totalFaces = 12;
	const resetTimeout = 10000;

	function generateImages() {
		const images: string[] = [];
		const subset = random.subset(70000, totalFaces);
		for (const n of subset) {
			const padded = ('00000' + n).slice(-5);
			images.push(`https://s3.us-east-2.amazonaws.com/data.languagegam.es/faces/${padded}.jpg`);
		}
		imageURLS = images;
	}

	function newFaces() {
		generateImages();
		sendMessage({ type: 'newFaces' });
	}

	function clickFace(i: number) {
		if (currentPhase === 'choosing' && isChooser) {
			chosenFace = i;
			currentPhase = 'guessing';
			sendMessage({ type: 'newPhase', currentPhase });
		}
		if (currentPhase === 'guessing' && !isChooser) {
			if (eliminatedFaces.has(i)) {
				eliminatedFaces.delete(i);
			} else {
				eliminatedFaces.add(i);
			}
			eliminatedFaces = eliminatedFaces;
			if (eliminatedFaces.size === totalFaces - 1) {
				const nonEliminated = imageURLS.map((_, i) => i).filter((x) => !eliminatedFaces.has(x))[0];
				sendMessage({ type: 'guessFace', face: nonEliminated });
			}
		}
	}

	function reset() {
		chooserIndex = (chooserIndex + 1) % playerIds.length;
		currentPhase = 'choosing';
		eliminatedFaces = new Set();
		playerGuesses = {};
		chosenFace = undefined;
		generateImages();
	}

	function countdown() {
		const interval = setInterval(() => {
			timeRemaining = Math.round((revealTimestamp + resetTimeout - +new Date()) / 1000);
			if (timeRemaining <= 0) {
				clearInterval(interval);
			}
		}, 100);
		intervals.push(interval);
	}

	function onMessage(id: string, message) {
		if (message.type === 'newFaces') {
			generateImages();
		}
		if (message.type === 'newPhase') {
			currentPhase = message.currentPhase;
		}
		if (message.type === 'guessFace' && isChooser) {
			playerGuesses[id] = message.face;
			playerGuesses = playerGuesses;
			if (Object.keys(playerGuesses).length === playerIds.length - 1) {
				revealTimestamp = +new Date();
				sendMessage({ type: 'revealAnswer', playerGuesses, chosenFace });
				currentPhase = 'revealing';
				countdown();
				const timeout = setTimeout(() => {
					reset();
					sendMessage({ type: 'reset' });
				}, 10000);
				timeouts.push(timeout);
			}
		}
		if (message.type === 'revealAnswer') {
			playerGuesses = message.playerGuesses;
			chosenFace = message.chosenFace;
			revealTimestamp = +new Date();
			currentPhase = 'revealing';
			countdown();
		}
		if (message.type === 'reset') {
			reset();
		}
	}

	onMount(() => {
		generateImages();
		addMessageListener(onMessage);
	});

	onDestroy(() => {
		removeMessageListener(onMessage);
		timeouts.forEach((timeout) => clearTimeout(timeout));
		intervals.forEach((interval) => clearInterval(interval));
		timeouts = [];
		intervals = [];
	});
</script>

<div class="container">
	{#if currentPhase === 'revealing'}
		<h4 class="center">{$_('guess-who.time-to-reset', { values: { 0: timeRemaining } })}</h4>
		<div class="reveal center">
			<div>
				<h5>{$_('guess-who.reveal-guess', translationValues)}</h5>
				<img src={imageURLS[chosenFace]} alt="Correct face" width={256} height={256} />
			</div>
			{#each Object.keys(playerGuesses) as id}
				<div>
					<h5>{$_('guess-who.reveal-guess', { values: { 0: playerNames[id] } })}</h5>
					<img src={imageURLS[playerGuesses[id]]} alt="Guessed face" width={256} height={256} />
					{#if playerGuesses[id] === chosenFace}
						<div class="alert alert-success">{$_('guess-who.correct-guess')}</div>
					{:else}
						<div class="alert alert-danger">{$_('guess-who.incorrect-guess')}</div>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<div class="instructions alert alert-info">
			<h4 class="alert-heading">
				{#if currentPhase === 'choosing'}
					{#if isChooser}
						{$_('guess-who.choose')}
					{:else}
						{$_('guess-who.wait', translationValues)}
					{/if}
				{/if}
				{#if currentPhase === 'guessing'}
					{#if isChooser}
						{$_('guess-who.guessing-answer')}
					{:else}
						{$_('guess-who.guessing-ask')}
					{/if}
				{/if}
			</h4>
			{#if currentPhase === 'choosing'}
				{#if isChooser}
					{$_('guess-who.choose-instructions')}
				{:else}
					{$_('guess-who.wait-instructions', translationValues)}
				{/if}
			{/if}
			{#if currentPhase === 'guessing'}
				{#if isChooser}
					{$_('guess-who.guessing-answer-instructions', translationValues)}
				{:else}
					{$_('guess-who.guessing-ask-instructions', translationValues)}<br />
					{$_('guess-who.guessing-ask-instructions-footer')}
				{/if}
			{/if}
		</div>

		<div class="actions">
			{#if currentPhase === 'choosing' && isChooser}
				<button on:click={newFaces} class="btn btn-primary">
					{$_('guess-who.new-faces')}
				</button>
			{/if}
		</div>

		{#if !(currentPhase === 'choosing' && !isChooser)}
			<div class="faces">
				{#each imageURLS as image, i}
					<img
						src={image}
						alt="Random face"
						on:click={() => clickFace(i)}
						class:chosen={i === chosenFace}
						class:eliminated={eliminatedFaces.has(i)}
						width={256}
						height={256}
					/>
				{/each}
			</div>
		{:else}
			<div class="center">
				<Spinner color="primary" />
			</div>
		{/if}
	{/if}
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.alert {
		margin-bottom: 0;
	}
	.actions {
		display: flex;
		padding: 8px 0;
	}
	.actions button {
		flex-grow: 1;
	}
	.faces {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		flex-grow: 1;
		height: 100%;
	}
	.faces img {
		width: 33%;
		height: auto;
		max-width: 256px;
		border: 5px solid transparent;
		cursor: pointer;
		object-fit: contain;
		opacity: 1;
	}

	@media (min-width: 768px) {
		.faces img {
			width: 25%;
		}
	}

	.faces img:hover {
		opacity: 0.75;
	}

	img.chosen {
		border: 5px solid red;
	}
	img.eliminated {
		opacity: 0.1;
	}
	img.eliminated:hover {
		opacity: 0.05;
	}

	.reveal {
		display: flex;
	}

	.reveal div {
		flex-grow: 1;
	}

	.reveal img {
		width: 100%;
		height: auto;
		border: 5px solid transparent;
	}

	.reveal .alert {
		margin: 8px;
	}

	.center {
		text-align: center;
	}
</style>
