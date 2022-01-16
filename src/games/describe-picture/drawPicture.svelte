<script lang="ts">
	import { simplifyLine } from './simplify';

	type Stroke = [number[], number[]];
	let strokes: Stroke[] = [];

	const WIDTH = 256;

	function getPath([xs, ys]: Stroke) {
		const d = [`M ${xs[0]} ${ys[0]}`];
		for (let i = 1; i < xs.length; i++) {
			d.push(`L ${xs[i]} ${ys[i]}`);
		}
		return d.join(' ');
	}

	let isDrawing = false;
	function startStroke(x: number, y: number) {
		isDrawing = true;
		strokes.push([[x], [y]]);
		strokes = strokes;
	}

	function midStroke(x: number, y: number) {
		if (!isDrawing) {
			return;
		}
		strokes[strokes.length - 1][0].push(x);
		strokes[strokes.length - 1][1].push(y);
		strokes[strokes.length - 1] = strokes[strokes.length - 1];
	}

	function endStroke(x: number, y: number) {
		if (!isDrawing) {
			return;
		}
		strokes[strokes.length - 1][0].push(x);
		strokes[strokes.length - 1][1].push(y);
		isDrawing = false;
		strokes[strokes.length - 1] = simplifyLine(...strokes[strokes.length - 1], 0.5);
		console.log(strokes[strokes.length - 1]);
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
		const width = svg.clientWidth;
		const height = svg.clientHeight;
		return [(e.touches[0].clientX * WIDTH) / width, (e.touches[0].clientY * WIDTH) / height];
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
		const [x, y] = touchCoords(e);
		endStroke(x, y);
	}
</script>

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
	{#each strokes as stroke}
		<path d={getPath(stroke)} stroke="black" fill="none" stroke-linejoin="round" />
	{/each}
</svg>

<style>
	svg {
		border: 1px solid black;
		max-width: 100%;
		max-height: 100%;
		aspect-ratio: 1;
		box-sizing: border-box;
	}
</style>
