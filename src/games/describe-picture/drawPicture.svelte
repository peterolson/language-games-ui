<script lang="ts">
	import { onDestroy, tick } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { Icon } from 'sveltestrap';

	import type { Stroke, StrokeData, Tool } from './drawing.types';
	import { getPath, getStrokeColor, getStrokeWidth } from './drawing.util';

	import { simplifyLine } from './simplify';

	export let onDrawStroke: (stroke: StrokeData) => void;
	export let onClearStrokes: () => void;
	export let onRemoveStroke: (stroke: StrokeData) => void;

	let strokes: StrokeData[] = [];

	const WIDTH = 256;

	let isDrawing = false;
	let interval;
	let activeTool: Tool = 'pencil';

	function getId() {
		return +new Date() + '_' + Math.floor(Math.random() * 100000);
	}

	function onTick() {
		const lastStroke = strokes[strokes.length - 1];
		strokes[strokes.length - 1] = {
			...lastStroke,
			stroke: simplifyLine(...lastStroke.stroke, 0.5)
		};
		onDrawStroke(strokes[strokes.length - 1]);
		const { stroke: oldStroke } = strokes[strokes.length - 1];
		let x = oldStroke[0].slice(-1)[0];
		let y = oldStroke[1].slice(-1)[0];
		strokes.push({
			id: getId(),
			stroke: [[x], [y]],
			type: activeTool
		});
		strokes = strokes;
	}

	function startStroke(x: number, y: number) {
		isDrawing = true;
		strokes.push({
			id: getId(),
			stroke: [[x], [y]],
			type: activeTool
		});
		strokes = strokes;
		interval = setInterval(onTick, 500);
	}

	function midStroke(x: number, y: number) {
		if (!isDrawing) {
			return;
		}
		strokes[strokes.length - 1].stroke[0].push(x);
		strokes[strokes.length - 1].stroke[1].push(y);
		strokes[strokes.length - 1] = strokes[strokes.length - 1];
	}

	function endStroke(x?: number, y?: number) {
		clearInterval(interval);
		if (!isDrawing) {
			return;
		}
		if (x !== undefined && y !== undefined) {
			strokes[strokes.length - 1].stroke[0].push(x);
			strokes[strokes.length - 1].stroke[1].push(y);
		}
		isDrawing = false;
		const lastStroke = strokes[strokes.length - 1];
		strokes[strokes.length - 1] = {
			...lastStroke,
			stroke: simplifyLine(...lastStroke.stroke, 0.5)
		};
		onDrawStroke(strokes[strokes.length - 1]);
		console.log(strokes);
	}

	function coords(e: MouseEvent): [number, number] {
		const svg = (e.target as SVGElement).closest('svg');
		const width = svg.clientWidth;
		const height = svg.clientHeight;
		return [(e.offsetX * WIDTH) / width, (e.offsetY * WIDTH) / height];
	}

	function touchCoords(e: TouchEvent): [number, number] {
		e.preventDefault();
		const svg = (e.target as SVGElement).closest('svg');
		const rect = svg.getBoundingClientRect();
		const width = rect.width;
		const height = rect.height;
		const touch = e.touches[0];
		const x = touch.clientX - rect.left;
		const y = touch.clientY - rect.top;
		return [x * (WIDTH / width), y * (WIDTH / height)];
	}

	function mouseDown(e: MouseEvent) {
		startStroke(...coords(e));
	}

	function mouseMove(e: MouseEvent) {
		midStroke(...coords(e));
	}

	function mouseUp(e: MouseEvent) {
		endStroke(...coords(e));
	}

	function touchstart(e: TouchEvent) {
		const [x, y] = touchCoords(e);
		startStroke(x, y);
	}

	function touchmove(e: TouchEvent) {
		const [x, y] = touchCoords(e);
		midStroke(x, y);
	}

	function touchend(e: TouchEvent) {
		endStroke();
	}

	function clear() {
		strokes = [];
		onClearStrokes();
		activeTool = 'pencil';
	}

	function undo() {
		if (!strokes.length) return;
		const lastStroke = strokes.pop();
		onRemoveStroke(lastStroke);
		strokes = strokes;
	}

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<div class="drawingBoard">
	<div class="controls">
		<button
			class="btn"
			class:btn-outline-primary={activeTool === 'pencil'}
			on:click={() => (activeTool = 'pencil')}
		>
			<Icon name="pencil" />
		</button>
		<button
			class="btn"
			class:btn-outline-primary={activeTool === 'eraser'}
			on:click={() => (activeTool = 'eraser')}
		>
			<Icon name="eraser" />
		</button>
		<button class="btn btn-outline-secondary" on:click={undo}>
			{$_('describe-picture.undo')}
		</button>
		<button class="btn btn-outline-secondary" on:click={clear}>
			{$_('describe-picture.clear')}
		</button>
	</div>
	<div class="canvas">
		<svg
			viewBox={`0 0 ${WIDTH} ${WIDTH}`}
			xmlns="http://www.w3.org/2000/svg"
			on:mousedown={mouseDown}
			on:mousemove={mouseMove}
			on:mouseup={mouseUp}
			on:mouseleave={mouseUp}
			on:touchstart={touchstart}
			on:touchmove={touchmove}
			on:touchend={touchend}
		>
			{#each strokes as { stroke, id, type }}
				<path
					d={getPath(stroke)}
					stroke={getStrokeColor(type)}
					fill="none"
					stroke-width={getStrokeWidth(type)}
					stroke-linecap="round"
				/>
			{/each}
		</svg>
	</div>
</div>

<style>
	.drawingBoard {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.controls {
		padding: 8px;
	}
	.canvas {
		flex: 1;
		max-width: 100%;
		max-height: 100%;
		aspect-ratio: 1;
		border: 1px solid black;
	}
</style>
