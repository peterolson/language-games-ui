import type { Stroke, Tool } from './drawing.types';

export function getPath([xs, ys]: Stroke): string {
	const d = [`M ${xs[0]} ${ys[0]}`];
	for (let i = 1; i < xs.length; i++) {
		d.push(`L ${xs[i]} ${ys[i]}`);
	}
	return d.join(' ');
}

export function getStrokeColor(tool: Tool): string {
	return tool === 'pencil' ? 'black' : 'white';
}

export function getStrokeWidth(tool: Tool): number {
	return tool === 'pencil' ? 4 : 20;
}
