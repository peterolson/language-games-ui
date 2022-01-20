// algorithms from https://stackoverflow.com/a/47593316/546661

export class Random {
	private rand: () => number;

	constructor(seedString: string) {
		const seed = xmur3(seedString);
		this.rand = sfc32(seed(), seed(), seed(), seed());
	}

	public random(): number {
		return this.rand();
	}

	public subset(max: number, size: number): number[] {
		const set = new Set<number>();
		while (set.size < size) {
			set.add(Math.floor(this.random() * max));
		}
		return Array.from(set);
	}

	public item<T>(items: T[]): T {
		return items[this.index(items.length)];
	}

	public index(max: number): number {
		return Math.floor(this.random() * max);
	}

	public shuffle<T>(items: T[]): T[] {
		const copy = items.slice();
		for (let i = copy.length - 1; i > 0; i--) {
			const j = Math.floor(this.random() * (i + 1));
			[copy[i], copy[j]] = [copy[j], copy[i]];
		}
		return copy;
	}
}

function xmur3(str: string) {
	let i: number, h: number;
	for (i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
		(h = Math.imul(h ^ str.charCodeAt(i), 3432918353)), (h = (h << 13) | (h >>> 19));
	return function () {
		h = Math.imul(h ^ (h >>> 16), 2246822507);
		h = Math.imul(h ^ (h >>> 13), 3266489909);
		return (h ^= h >>> 16) >>> 0;
	};
}

function sfc32(a: number, b: number, c: number, d: number) {
	return function () {
		a >>>= 0;
		b >>>= 0;
		c >>>= 0;
		d >>>= 0;
		let t = (a + b) | 0;
		a = b ^ (b >>> 9);
		b = (c + (c << 3)) | 0;
		c = (c << 21) | (c >>> 11);
		d = (d + 1) | 0;
		t = (t + d) | 0;
		c = (c + t) | 0;
		return (t >>> 0) / 4294967296;
	};
}
