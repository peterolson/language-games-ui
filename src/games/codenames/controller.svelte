<script lang="ts">
	import { Random } from '../../data/random';
	import { onDestroy, onMount } from 'svelte';
	import { number, _ } from 'svelte-i18n';
	import { page } from '$app/stores';
	import { getLanguageByCode } from '../../data/languages';
	import { gameWords } from 'multilingual-game-words';
	import type { WordPair } from 'multilingual-game-words';
	import { Icon } from 'sveltestrap';

	export let selfId: string;
	export let addMessageListener: (listener: (id: string, message: string) => void) => void;
	export let removeMessageListener: (listener: (id: string, message: string) => void) => void;
	export let sendMessage: (message: unknown) => void;
	export let playerNames: Record<string, string>;
	export let room: string;

	const { lang } = $page.params;
	const { code: langCode } = getLanguageByCode(lang);
	const random = new Random(room);

	const playerIds = random.shuffle(Object.keys(playerNames).sort());
	let describerIndex = 0;

	let allWords: WordPair[] = [];
	let availableWords: Set<WordPair> = new Set();
	let currentWords: WordPair[] = [];

	let bombIndices: Set<number>;
	let emptyIndices: Set<number>;
	let team1Indices: Set<number>;
	let team2Indices: Set<number>;
	const WORD_COUNT = 20;

	let isGuessing = false;
	let guessedIndices: Set<number> = new Set();
	let guessesRemaining: number;
	let boom = false;

	let guessedWords: { word: string; isCorrect: boolean }[] = [];

	async function getNextWords() {
		if (!allWords.length || availableWords.size < WORD_COUNT) {
			allWords = (await gameWords(langCode)).getAllWords();
			availableWords = new Set(allWords);
		}
		const words = Array.from(availableWords).sort();
		const currentIndices = random.subset(availableWords.size, WORD_COUNT);
		currentWords = words.filter((_, i) => currentIndices.includes(i));
		for (const word of currentWords) {
			availableWords.delete(word);
		}
		availableWords = availableWords;
		const indices = random.shuffle(Array.from(Array(WORD_COUNT).keys()));
		bombIndices = new Set(indices.slice(0, 2));
		emptyIndices = new Set(indices.slice(2, Math.ceil(WORD_COUNT / 2) + 1));
		team1Indices = new Set(indices.slice(Math.ceil(WORD_COUNT / 2) + 1));
		team2Indices = new Set();
	}

	const attempt = (n) => () => {
		sendMessage({
			type: 'attempt',
			n
		});
		isGuessing = true;
		guessesRemaining = n;
	};

	function clickWord(index) {
		if (isGuessing && selfId !== playerIds[describerIndex]) {
			if (guessedIndices.has(index)) {
				return;
			}
			guessedIndices.add(index);
			guessedIndices = guessedIndices;
			guessesRemaining--;
			if (bombIndices.has(index)) {
				boom = true;
			}
			let isCorrect = team1Indices.has(index);
			guessedWords = [{ word: currentWords[index].word, isCorrect }, ...guessedWords];
			sendMessage({
				type: 'guess',
				index,
				isCorrect
			});
			if (!isCorrect || guessesRemaining === 0) {
				isGuessing = false;
				guessedWords = [{ word: '', isCorrect: false }, ...guessedWords];
			}
		}
	}

	function nextRound() {
		guessedWords = [];
		guessedIndices = new Set();
		isGuessing = false;
		boom = false;
		getNextWords();
		describerIndex = (describerIndex + 1) % playerIds.length;
	}

	const messageHandlers = {
		attempt: (_id, { n }) => {
			isGuessing = true;
			guessesRemaining = n;
		},
		guess: (_id, { index, isCorrect }) => {
			if (guessedIndices.has(index)) {
				return;
			}
			guessedIndices.add(index);
			guessedIndices = guessedIndices;
			guessesRemaining--;
			if (bombIndices.has(index)) {
				boom = true;
			}
			guessedWords = [{ word: currentWords[index].word, isCorrect }, ...guessedWords];
			if (!isCorrect || guessesRemaining === 0) {
				isGuessing = false;
				guessedWords = [{ word: '', isCorrect: false }, ...guessedWords];
			}
		},
		nextRound: (_id) => {
			nextRound();
		},
		skipTurn: (_id) => {
			isGuessing = false;
			guessedWords = [{ word: '', isCorrect: false }, ...guessedWords];
		}
	};

	function initiateNextRound() {
		nextRound();
		sendMessage({
			type: 'nextRound'
		});
	}

	function skipTurn() {
		isGuessing = false;
		guessedWords = [{ word: '', isCorrect: false }, ...guessedWords];
		sendMessage({
			type: 'skipTurn'
		});
	}

	function onMessage(id: string, message) {
		if (!(message?.type in messageHandlers)) return;
		messageHandlers[message.type](id, message);
	}

	function setDifference<T>(a: Set<T>, b: Set<T>): Set<T> {
		const result = new Set(a);
		for (const item of b) {
			result.delete(item);
		}
		return result;
	}

	function getAttemptButtons() {
		console.log(team1Indices, guessedIndices, setDifference(team1Indices, guessedIndices));
		const itemsRemaining = setDifference(team1Indices, guessedIndices).size;
		const buttons = [];
		for (let i = 1; i <= itemsRemaining && i <= 5; i++) {
			buttons.push(i);
		}
		return buttons;
	}

	onMount(async () => {
		await getNextWords();
		addMessageListener(onMessage);
	});

	onDestroy(() => {
		removeMessageListener(onMessage);
	});
</script>

{#if guessedIndices.size > 0 && setDifference(team1Indices, guessedIndices).size === 0}
	<div class="alert text-center">
		<h3 class="alert-heading">{$_('codenames.goodJob')}</h3>
		<p>
			{$_('codenames.statistics', {
				values: {
					0: team1Indices.size,
					1: guessedWords.filter((x) => !x.word).length
				}
			})}
		</p>
		<button class="btn btn-primary" on:click={initiateNextRound}>
			{$_('codenames.nextRound')}
		</button>
	</div>
{:else}
	{#if selfId === playerIds[describerIndex]}
		{#if !isGuessing && !boom && team1Indices}
			<div class="text-center pb-2">
				<h5>How many words do you want to attempt?</h5>
				{#each getAttemptButtons() as n}
					<button class="btn btn-secondary m-1" on:click={attempt(n)}>{n}</button>
				{/each}
			</div>
		{/if}
	{:else if isGuessing}
		<div class="text-center pb-2">
			<h5>{$_('codenames.guessesRemaining', { values: { 0: guessesRemaining } })}</h5>
		</div>
	{/if}
	<div class="word-grid" class:boom>
		{#if boom}
			<div class="text-center">
				<h3 class="shake">{$_('codenames.ohno')}</h3>
				<img src="/img/explosion.gif" alt="Exploding bomb" />
				<h3>{$_('codenames.bombExploded')}</h3>
				<button class="btn btn-secondary" on:click={initiateNextRound}>
					{$_('codenames.nextRound')}
				</button>
			</div>
		{:else}
			{#each currentWords as word, index}
				<div
					class="word-cell"
					class:bomb={bombIndices.has(index)}
					class:empty={emptyIndices.has(index)}
					class:team1={team1Indices.has(index)}
					class:team2={team2Indices.has(index)}
					class:guessed={guessedIndices.has(index)}
					class:describer={selfId === playerIds[describerIndex]}
					on:click={() => clickWord(index)}
				>
					<h6>{word.word}</h6>
					{#if lang !== 'en'}
						<div>{word.en}</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
	{#if isGuessing && selfId !== playerIds[describerIndex]}
		<div class="text-center p-2">
			<button class="btn btn-secondary" on:click={skipTurn}>
				{$_('codenames.skipTurn')}
			</button>
		</div>
	{/if}
{/if}

<div>
	{#each guessedWords as { word, isCorrect }}
		{#if !word}
			<hr />
		{:else}
			<div
				class="alert d-flex align-items-center mt-3 p-2"
				class:alert-success={isCorrect}
				class:alert-danger={!isCorrect}
			>
				<Icon name={isCorrect ? 'check-circle-fill' : 'dash-circle-fill'} />
				<div class="m-1">
					{word}
				</div>
			</div>
		{/if}
	{/each}
</div>

<style>
	.word-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		grid-gap: 4px;
	}

	@keyframes shake {
		0% {
			transform: skewX(0deg) translateX(4px) translateY(0px);
		}
		25% {
			transform: skewX(10deg) translateX(0px) translateY(-4px);
		}
		50% {
			transform: skewX(0deg) translateX(-7px) translateY(0px);
		}
		75% {
			transform: skewX(-15deg) translateX(0px) translateY(3px);
		}
		100% {
			transform: skewX(0deg) translateX(2px) translateY(0px);
		}
	}

	.word-grid.boom {
		background-color: black;
		color: white;
		padding: 16px;
	}

	.boom .shake {
		animation: shake 0.2s infinite alternate;
	}

	.word-cell {
		padding: 8px;
		text-align: center;
		border: 2px outset #ccc;
		cursor: pointer;
		opacity: 0.85;
		transition: background-color 400ms ease-in-out, color 400ms ease-in-out;
	}

	.word-cell:hover {
		opacity: 1;
		border: 2px inset #ccc;
	}

	.word-cell h6 {
		margin-block-end: 4px;
	}

	.word-cell div {
		font-size: 0.8em;
		opacity: 0.7;
	}

	.describer.bomb,
	.guessed.bomb {
		background-color: #333;
		color: #fff;
	}

	.describer.empty,
	.guessed.empty {
		background-color: rgb(250, 238, 199);
	}

	.describer.team1,
	.guessed.team1 {
		background-color: rgb(0, 0, 177);
		color: #fff;
	}

	.describer.team2,
	.guessed.team2 {
		background-color: rgb(153, 0, 0);
		color: #fff;
	}

	.describer.guessed {
		opacity: 0.1;
		border: 2px solid rgba(0, 0, 0, 0);
	}
</style>
