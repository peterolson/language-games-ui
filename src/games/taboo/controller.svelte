<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { gameWords } from 'multilingual-game-words';
	import type { WordPair } from 'multilingual-game-words';
	import { page } from '$app/stores';
	import { Icon } from 'sveltestrap';
	import { getLanguageByCode } from '../../data/languages';

	export let selfId: string;
	export let addMessageListener: (listener: (id: string, message: string) => void) => void;
	export let sendMessage: (message: unknown) => void;
	export let playerNames: Record<string, string>;

	let words: WordPair[] = [];
	let availableWords: WordPair[] = [];
	let finishedWords: WordPair[] = [];
	let missedWord: WordPair;

	const { lang } = $page.params;
	const { code: langCode } = getLanguageByCode(lang);

	const playerIds = Object.keys(playerNames).sort();
	const secondsPerTurn = 90.49;
	const secondsBetweenTurns = 10.49;

	let currentPlayerIndex = 0;
	let currentWordIndex;
	let turnStartedTimestamp: number;
	let currentTimestamp: number;
	let isBetweenTurns = true;
	let playerScores: Record<string, number> = {};

	function wait(seconds) {
		return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
	}

	async function startTurn() {
		turnStartedTimestamp = Date.now();
		isBetweenTurns = true;
		sendMessage({ type: 'betweenTurns', timestamp: turnStartedTimestamp });
		await wait(secondsBetweenTurns);
		finishedWords = [];
		missedWord = null;
		isBetweenTurns = false;
		skip();
		turnStartedTimestamp = Date.now();
		sendMessage({ type: 'startTurn', timestamp: turnStartedTimestamp });
		await wait(secondsPerTurn);
		currentPlayerIndex = (currentPlayerIndex + 1) % playerIds.length;
		missedWord = availableWords[currentWordIndex];
		sendMessage({
			type: 'nextPlayer',
			playerIndex: currentPlayerIndex,
			lastWord: missedWord
		});
	}

	function nextWord() {
		const word = availableWords[currentWordIndex];
		sendMessage({ type: 'nextWord', word });
		finishedWords.unshift(word);
		finishedWords = finishedWords;
		skip();
		playerScores[selfId] = (playerScores[selfId] || 0) + 1;
		playerScores = playerScores;
	}

	function skip() {
		console.log(currentWordIndex, availableWords);
		if (currentWordIndex != null) {
			availableWords.splice(currentWordIndex, 1);
		}
		if (!availableWords.length) {
			availableWords = [...words];
		}
		currentWordIndex = Math.floor(Math.random() * availableWords.length);
	}

	function removeWord(word: WordPair) {
		const index = availableWords.findIndex((w) => w.word === word.word);
		if (index >= 0) {
			availableWords.splice(index, 1);
		}
	}

	const messageHandlers = {
		startTurn: (_id, { timestamp }) => {
			turnStartedTimestamp = timestamp;
			isBetweenTurns = false;
			missedWord = null;
			finishedWords = [];
		},
		betweenTurns: (_id, { timestamp }) => {
			isBetweenTurns = true;
			turnStartedTimestamp = timestamp;
		},
		nextPlayer: (_id, { playerIndex, lastWord }) => {
			missedWord = lastWord;
			currentPlayerIndex = playerIndex;
			removeWord(lastWord);
			if (selfId === playerIds[currentPlayerIndex]) {
				startTurn();
			}
		},
		nextWord: (id, { word }) => {
			playerScores[id] = (playerScores[id] || 0) + 1;
			playerScores = playerScores;
			finishedWords.unshift(word);
			finishedWords = finishedWords;
			removeWord(word);
		}
	};

	function onMessage(id: string, message) {
		messageHandlers[message.type](id, message);
	}

	function formatTimeRemaining(currentTimestamp: number, turnStartedTimestamp: number) {
		if (!currentTimestamp || !turnStartedTimestamp) {
			return '';
		}
		const timeRemaining = Math.max(
			0,
			secondsPerTurn - (currentTimestamp - turnStartedTimestamp) / 1000
		);
		const minutes = Math.floor(timeRemaining / 60);
		const seconds = Math.floor(timeRemaining % 60);
		return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
	}

	const tick = setInterval(() => {
		currentTimestamp = Date.now();
	}, 107);

	onMount(async () => {
		addMessageListener(onMessage);
		words = (await gameWords(langCode)).getAllWords();
		availableWords = [...words];
		if (playerIds[currentPlayerIndex] === selfId) {
			startTurn();
		}
	});

	onDestroy(() => {
		clearTimeout(tick);
	});
</script>

<div class="container">
	<div class="players">
		{#each playerIds as playerId}
			<div class="player" class:currentPlayer={playerId === playerIds[currentPlayerIndex]}>
				<div class="player-name">
					{playerNames[playerId]}
				</div>
				<div class="player-score">{playerScores[playerId] || 0}</div>
			</div>
		{/each}
	</div>

	{#if turnStartedTimestamp && currentTimestamp}
		{#if isBetweenTurns}
			<h2>
				{$_('taboo.nextRound', {
					values: {
						0: Math.max(
							0,
							Math.round(
								(turnStartedTimestamp + secondsBetweenTurns * 1000 - currentTimestamp) / 1000
							)
						)
					}
				})}
			</h2>
		{:else}
			<h2>{formatTimeRemaining(currentTimestamp, turnStartedTimestamp)}</h2>
		{/if}
	{/if}

	{#if currentWordIndex !== undefined && playerIds[currentPlayerIndex] === selfId && !isBetweenTurns}
		<div class="card currentWord">
			<h3 class="card-title">{availableWords[currentWordIndex].word}</h3>

			{#if langCode !== 'en'}
				<h5 class="text-muted">{availableWords[currentWordIndex].en}</h5>
			{/if}
			<button class="btn btn-secondary" on:click={skip}>{$_('taboo.skip')}</button>
			<button class="btn btn-primary" on:click={nextWord}>{$_('taboo.nextWord')}</button>
		</div>
	{/if}

	{#if missedWord}
		<div class="finished-word alert alert-danger d-flex align-items-center">
			<Icon name="dash-circle-fill" />
			<div>
				<h5>{missedWord.word}</h5>
				{#if langCode !== 'en'}
					<h6 class="text-muted">{missedWord.en}</h6>
				{/if}
			</div>
		</div>
	{/if}
	{#each finishedWords as word}
		<div class="finished-word alert alert-success d-flex align-items-center">
			<Icon name="check-circle-fill" />
			<div>
				<h5>{word.word}</h5>
				{#if langCode !== 'en'}
					<h6 class="text-muted">{word.en}</h6>
				{/if}
			</div>
		</div>
	{/each}
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.players {
		display: flex;
		justify-content: space-between;
	}

	.player {
		text-align: center;
	}

	.currentPlayer .player-name {
		font-weight: bold;
	}

	.currentWord {
		padding: 8px;
		margin: 8px;
		text-align: center;
	}
	.currentWord button {
		margin: 4px;
	}
	h2 {
		text-align: center;
	}

	.finished-word {
		padding: 8px;
		margin: 8px;
		padding-left: 8px;
	}
	.finished-word div {
		margin-left: 8px;
	}

	.finished-word h5,
	.finished-word h6 {
		margin-bottom: 2px;
	}
</style>
