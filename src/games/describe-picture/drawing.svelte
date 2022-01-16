<script lang="ts">
	const drawing = {
		word: 'backpack',
		countrycode: 'BG',
		timestamp: '2017-01-31 17:24:42.07485 UTC',
		recognized: true,
		key_id: '5406377436512256',
		drawing: [
			[
				[45, 87, 144, 148, 149, 160, 184],
				[18, 13, 23, 21, 15, 15, 23]
			],
			[
				[39, 39, 43, 47, 67, 115, 130, 156, 190, 204, 215, 215, 203, 199],
				[23, 134, 163, 173, 187, 199, 199, 186, 164, 146, 119, 82, 35, 33]
			],
			[
				[34, 57, 75, 163, 172, 172, 206],
				[89, 82, 82, 89, 88, 79, 82]
			],
			[
				[143, 143],
				[69, 69]
			],
			[
				[120, 122],
				[61, 62]
			],
			[
				[34, 21, 3, 0, 6, 18, 42],
				[12, 2, 29, 139, 160, 166, 164]
			],
			[
				[197, 210, 226, 238, 246, 251, 255, 255, 252, 242, 239, 225, 217, 213, 203],
				[23, 10, 1, 0, 3, 13, 65, 125, 147, 169, 174, 174, 160, 158, 160]
			]
		]
	};

	function getPath([xs, ys]: number[][]) {
		const d = [`M ${xs[0]} ${ys[0]}`];
		for (let i = 1; i < xs.length; i++) {
			d.push(`L ${xs[i]} ${ys[i]}`);
		}
		return d.join(' ');
	}
</script>

<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
	{#each drawing.drawing as stroke}
		<path d={getPath(stroke)} stroke="black" fill="none" />
	{/each}
</svg>

<style>
	svg {
		width: 100%;
		max-height: 100%;
		aspect-ratio: 1;
	}
</style>
