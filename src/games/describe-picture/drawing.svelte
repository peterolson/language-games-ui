<script lang="ts">
	import type { Stroke } from './drawing.types';

	export let strokes: Stroke[] = [];

	function getPath([xs, ys]: Stroke) {
		const d = [`M ${xs[0]} ${ys[0]}`];
		for (let i = 1; i < xs.length; i++) {
			d.push(`L ${xs[i]} ${ys[i]}`);
		}
		return d.join(' ');
	}
</script>

<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
	{#each strokes as stroke}
		<path d={getPath(stroke)} stroke="black" fill="none" stroke-width="4" />
	{/each}
</svg>

<style>
	svg {
		width: 256px;
		height: 256px;
	}
</style>
