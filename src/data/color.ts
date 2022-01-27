import { Random } from './random';

export function colorFromString(str: string, luminosity = 25): string {
	const random = new Random(str);
	const hue = Math.round(random.random() * 360);
	return `hsl(${hue}, 100%, ${luminosity}%)`;
}
