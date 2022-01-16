<script>
	import Drawing from './drawing.svelte';
	import DrawPicture from './drawPicture.svelte';
</script>

<div class="container">
	<div>Hello</div>
	<div class="drawpad">
		<DrawPicture />
	</div>
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
</style>
