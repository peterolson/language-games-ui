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

	let drawerIndex = 0;
	let isDrawer: boolean;
	let pictureIndex: number;
	let translationValues: { values: Record<string, string> };

	let strokes: StrokeData[] = [];
	let pictureKey = 0;

	let isRevealed = false;

	$: {
		const drawerId = playerIds[drawerIndex];
		isDrawer = drawerId === selfId;
		translationValues = {
			values: {
				0: playerNames[drawerId],
				1: Object.keys(playerNames)
					.filter((x) => x !== drawerId)
					.map((x) => playerNames[x])
					.join(', ')
			}
		};
	}

	const messageHandlers = {
		drawStroke: (_id, { stroke }) => {
			strokes.push(stroke);
			strokes = strokes;
		},
		removeStroke: (_id, { stroke }) => {
			strokes = strokes.filter((x) => x.id !== stroke.id);
		},
		clearStrokes: () => {
			strokes = [];
		},
		changePicture: () => {
			pictureKey++;
		},
		revealPicture: (_id, args) => {
			strokes = args.strokes;
			pictureIndex = args.pictureIndex;
			console.log(args, strokes, pictureIndex);
			isRevealed = true;
		},
		next: (_id, args) => {
			isRevealed = false;
			drawerIndex = args.drawerIndex;
			strokes = [];
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
		strokes = [];
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
		drawerIndex = (drawerIndex + 1) % playerIds.length;
		newPicture();
		isRevealed = false;
		strokes = [];
		sendMessage({
			type: 'next',
			drawerIndex
		});
	}
</script>

<div class="container">
	{#if isRevealed}
		{#if isDrawer}
			<button class="btn btn-primary" on:click={next}>Next</button>
		{/if}
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
			<figure>
				<Drawing strokes={strokes.map((x) => x[1])} />
				<figcaption>{$_('describe-picture.drawingBy', translationValues)}</figcaption>
			</figure>
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
			disabled={!strokes.length}
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
			<Drawing {strokes} />
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
