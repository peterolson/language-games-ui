<script lang="ts">
	import type { Stroke, StrokeData } from './drawing.types';
	import { getPath, getStrokeColor, getStrokeWidth } from './drawing.util';

	export let strokes: StrokeData[] = [];
</script>

<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
	{#each strokes as { stroke, type }}
		<path
			d={getPath(stroke)}
			stroke={getStrokeColor(type)}
			fill="none"
			stroke-width={getStrokeWidth(type)}
			stroke-linecap="round"
		/>
	{/each}
</svg>

<style>
	svg {
		width: 256px;
		height: 256px;
	}
</style>
