<script lang="ts">
	import Drawing from './drawing.svelte';
	import DrawPicture from './drawPicture.svelte';
	import { Random } from '../../data/random';
	import { onDestroy, onMount } from 'svelte';
	import type { StrokeData } from './drawing.types';
	import { _ } from 'svelte-i18n';
	import { Button } from 'sveltestrap';

	export let selfId: string;
	export let room: string;
	export let addMessageListener: (listener: (id: string, message: string) => void) => void;
	export let removeMessageListener: (listener: (id: string, message: string) => void) => void;
	export let sendMessage: (message: unknown) => void;
	export let playerNames: Record<string, string>;

	const random = new Random(room);
	const playerIds = random.shuffle(Object.keys(playerNames).sort());

	let describerIndex = 0;
	let isDrawer: boolean;
	let pictureIndex: number;

	let strokes: Record<string, StrokeData[]> = {};
	let pictureKey = 0;

	let isRevealed = false;

	$: {
		const describerId = playerIds[describerIndex];
		isDrawer = describerId !== selfId;
	}

	const messageHandlers = {
		drawStroke: (id, { stroke }) => {
			strokes[id] = strokes[id] || [];
			strokes[id].push(stroke);
			strokes[id] = strokes[id];
		},
		removeStroke: (id, { stroke }) => {
			strokes[id] = (strokes[id] || []).filter((x) => x.id !== stroke.id);
		},
		clearStrokes: (id) => {
			strokes[id] = [];
		},
		changePicture: () => {
			pictureKey++;
		},
		revealPicture: (_id, args) => {
			strokes = args.strokes;
			pictureIndex = args.pictureIndex;
			isRevealed = true;
		},
		next: (_id, args) => {
			isRevealed = false;
			describerIndex = args.describerIndex;
			if (selfId === playerIds[describerIndex]) {
				newPicture();
			}
			strokes = {};
		}
	};

	function newPicture() {
		pictureIndex = Math.floor(Math.random() * 1351);
	}

	function onMessage(id: string, message) {
		if (!(message?.type in messageHandlers)) return;
		messageHandlers[message.type](id, message);
	}

	onMount(() => {
		addMessageListener(onMessage);
		if (!isDrawer) {
			newPicture();
		}
	});

	onDestroy(() => {
		removeMessageListener(onMessage);
	});

	function onDrawStroke(stroke: StrokeData) {
		sendMessage({
			type: 'drawStroke',
			stroke
		});
	}

	function onRemoveStroke(stroke: StrokeData) {
		sendMessage({
			type: 'removeStroke',
			stroke
		});
	}

	function onClearStrokes() {
		sendMessage({
			type: 'clearStrokes'
		});
	}

	function changePicture() {
		newPicture();
		sendMessage({
			type: 'changePicture'
		});
		strokes = {};
	}

	function revealPicture() {
		isRevealed = true;
		sendMessage({
			type: 'revealPicture',
			strokes,
			pictureIndex
		});
	}

	function next() {
		describerIndex = (describerIndex + 1) % playerIds.length;
		newPicture();
		isRevealed = false;
		strokes = {};
		sendMessage({
			type: 'next',
			describerIndex
		});
	}
</script>

<div class="container">
	{#if isRevealed}
		<button class="btn btn-primary mb-2" on:click={next}>Next</button>
		<div class="d-flex justify-content-around align-items-center flex-wrap">
			<figure>
				<img
					width="200"
					height="200"
					src={`https://s3.us-east-2.amazonaws.com/data.languagegam.es/doodles/${pictureIndex}.png`}
					alt=""
				/>
				<figcaption>{$_('describe-picture.original')}</figcaption>
			</figure>
			{#each playerIds as playerId}
				{#if playerId !== playerIds[describerIndex]}
					<figure>
						<Drawing strokes={strokes[playerId] || []} />
						<figcaption>
							{$_('describe-picture.drawingBy', { values: { 0: playerNames[playerId] } })}
						</figcaption>
					</figure>
				{/if}
			{/each}
		</div>
	{:else if isDrawer}
		<div class="drawpad">
			{#key pictureKey}
				<DrawPicture {onDrawStroke} {onClearStrokes} {onRemoveStroke} />
			{/key}
		</div>
	{:else}
		<div class="alert alert-info">
			<h4 class="alert-heading text-center">{$_('describe-picture.instructions-describe')}</h4>
		</div>
		<button
			class="btn btn-primary m-2"
			color="primary"
			disabled={!Object.keys(strokes).length}
			on:click={revealPicture}
		>
			{$_('describe-picture.done')}
		</button>
		<div class="d-flex justify-content-around align-items-center flex-wrap">
			{#if pictureIndex !== undefined}
				<div class="d-flex flex-column">
					<img
						width="200"
						height="200"
						src={`https://s3.us-east-2.amazonaws.com/data.languagegam.es/doodles/${pictureIndex}.png`}
						alt=""
					/>
					<button class="btn btn-secondary m-2" on:click={changePicture}>
						{$_('describe-picture.changePicture')}
					</button>
				</div>
			{/if}
			{#each playerIds as playerId}
				{#if playerId !== playerIds[describerIndex]}
					<figure>
						<Drawing strokes={strokes[playerId] || []} />
						<figcaption>
							{$_('describe-picture.drawingBy', { values: { 0: playerNames[playerId] } })}
						</figcaption>
					</figure>
				{/if}
			{/each}
		</div>
	{/if}
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.drawpad {
		flex-grow: 1;
		height: 100%;
		overflow: auto;
	}

	figure img {
		margin-top: 32px;
		margin-bottom: 32px;
	}

	figcaption {
		text-align: center;
	}
</style>
